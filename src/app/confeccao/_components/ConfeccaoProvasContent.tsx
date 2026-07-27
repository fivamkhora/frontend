"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileText,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Check,
  GraduationCap,
  Gauge,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { AssessmentPreview } from "./Preview/AssesmentPreview";

type AssessmentResponse = {
  data: {
    id: string;
    originalRequest?: {
      assessmentType?: string;
      classroomMaterial?: string;
      difficulty?: string;
      gradeLevel?: string;
      questionCount?: number;
      subject?: string;
      teacherInstructions?: string;
    };
    currentVersion: {
      version: number;
      assessment: {
        title: string;
        instructions: string;
        questions: unknown[];
        answerKey: unknown[];
      };
    };
  };
};

type AssessmentLookupResponse = {
  data: AssessmentResponse["data"] | AssessmentResponse["data"][];
};

export type AssessmentData =
  AssessmentResponse["data"]["currentVersion"]["assessment"];

export type NormalizedOption = {
  letter: string;
  text: string;
  selected: boolean;
};

export type NormalizedQuestion = {
  number: string;
  sourceNumber: string;
  statement: string;
  options: NormalizedOption[];
  points: string;
  type: string;
};

export type NormalizedAnswer = {
  number: string;
  answer: string;
  rubric: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function getQuestionStatement(question: unknown): string {
  const data = asRecord(question);

  return (
    asText(data.statement) ||
    asText(data.question) ||
    asText(data.enunciado) ||
    asText(data.prompt) ||
    asText(data.text) ||
    "Questão gerada sem enunciado informado."
  );
}

function getQuestionNumber(question: unknown, index: number): string {
  const data = asRecord(question);
  const number = asText(data.number);

  return number || String(index + 1);
}

export function normalizeAnswer(
  answer: unknown,
  index: number,
): NormalizedAnswer {
  if (typeof answer === "string" || typeof answer === "number") {
    return {
      number: String(index + 1).padStart(2, "0"),
      answer: String(answer),
      rubric: "",
    };
  }

  const data = asRecord(answer);
  const number = asText(data.number) || String(index + 1);

  return {
    number: number.padStart(2, "0"),
    answer:
      asText(data.answer) ||
      asText(data.correctAnswer) ||
      asText(data.correctOption) ||
      asText(data.option) ||
      asText(data.letter) ||
      "Resposta não informada.",
    rubric: asText(data.rubric) || asText(data.explanation),
  };
}

function getAnswerForQuestion(
  answerKey: unknown[],
  questionNumber: string,
  index: number,
): string {
  const answer =
    answerKey.find((item) => {
      const itemNumber = asText(asRecord(item).number);

      return itemNumber && itemNumber === String(Number(questionNumber));
    }) ?? answerKey[index];

  if (typeof answer === "string" || typeof answer === "number") {
    return String(answer).trim().toLowerCase();
  }

  const data = asRecord(answer);

  return (
    asText(data.answer) ||
    asText(data.correctAnswer) ||
    asText(data.correctOption) ||
    asText(data.option) ||
    asText(data.letter)
  )
    .trim()
    .toLowerCase();
}

export function normalizeOptions(question: unknown, selectedAnswer: string) {
  const data = asRecord(question);
  const rawOptions = data.options ?? data.alternatives ?? data.choices;

  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions.map((option, index) => {
    const optionData = asRecord(option);
    const letter =
      asText(optionData.letter) ||
      asText(optionData.label) ||
      asText(optionData.key) ||
      String.fromCharCode(65 + index);
    const text =
      asText(option) ||
      asText(optionData.text) ||
      asText(optionData.label) ||
      asText(optionData.content) ||
      asText(optionData.option);
    const normalizedLetter = letter.trim().toLowerCase();
    const normalizedText = text.trim().toLowerCase();

    return {
      letter,
      text,
      selected:
        Boolean(selectedAnswer) &&
        (selectedAnswer === normalizedLetter ||
          selectedAnswer === normalizedText),
    };
  });
}

export function normalizeQuestions(
  assessment: AssessmentData,
): NormalizedQuestion[] {
  return assessment.questions.map((question, index) => {
    const data = asRecord(question);
    const number = getQuestionNumber(question, index);
    const paddedNumber = number.padStart(2, "0");

    return {
      number: paddedNumber,
      sourceNumber: paddedNumber,
      statement: getQuestionStatement(question),
      options: normalizeOptions(
        question,
        getAnswerForQuestion(assessment.answerKey, number, index),
      ),
      points: asText(data.points),
      type: asText(data.type),
    };
  });
}

export function normalizeAnswers(
  assessment: AssessmentData,
): NormalizedAnswer[] {
  return assessment.answerKey.map(normalizeAnswer);
}

// ==========================================
// 3. OPÇÕES E CONFIGURAÇÕES
// ==========================================

const assessmentTypes = [
  { label: "Prova", value: "prova", icon: FileText },
  { label: "Quiz", value: "quiz", icon: Sparkles },
  { label: "Trabalho", value: "trabalho", icon: ClipboardList },
] as const;

const difficulties = [
  { label: "Fácil", value: "facil" },
  { label: "Médio", value: "medio" },
  { label: "Difícil", value: "dificil" },
] as const;

const gradeLevelsGrouped = [
  {
    group: "Ensino Fundamental - Anos Iniciais",
    options: ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"],
  },
  {
    group: "Ensino Fundamental - Anos Finais",
    options: ["6º ano", "7º ano", "8º ano", "9º ano"],
  },
  {
    group: "Ensino Médio",
    options: [
      "1ª série - Ensino Médio",
      "2ª série - Ensino Médio",
      "3ª série - Ensino Médio",
    ],
  },
  {
    group: "Ensino Superior / Pré-Vestibular",
    options: ["Pré-Vestibular / ENEM", "Ensino Superior"],
  },
];

const materiaisBase =
  "O ciclo da água é o movimento contínuo da água em nosso planeta. Ele envolve processos como a evaporação, passagem do estado líquido para o gasoso devido ao calor do Sol, condensação, formação de nuvens, e precipitação, chuva. A água também infiltra no solo, alimentando lençóis freáticos.";

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================

export function ConfeccaoProvasContent({
  assessmentIdToEdit,
}: {
  assessmentIdToEdit?: string;
}) {
  const router = useRouter();
  const editAssessmentId = assessmentIdToEdit;
  const [materia, setMateria] = useState("Ciências");
  const [anoEscolar, setAnoEscolar] = useState("6º ano");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("prova");
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(10);
  const [dificuldade, setDificuldade] = useState("medio");
  const [material, setMaterial] = useState(materiaisBase);
  const [instrucoes, setInstrucoes] = useState(
    "Inclua duas questões dissertativas",
  );
  const [loading, setLoading] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [resultado, setResultado] = useState<AssessmentResponse | null>(null);
  const [error, setError] = useState("");

  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsGradeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resumoConfiguracao = useMemo(
    () =>
      `${materia} | ${anoEscolar} | ${tipoAvaliacao} | ${quantidadeQuestoes} questões`,
    [materia, anoEscolar, quantidadeQuestoes, tipoAvaliacao],
  );

  const assessmentId = resultado?.data.id;
  const isRevisionMode = Boolean(assessmentId);

  const reiniciarConfeccao = () => {
    setMateria("Ciências");
    setAnoEscolar("6º ano");
    setTipoAvaliacao("prova");
    setQuantidadeQuestoes(10);
    setDificuldade("medio");
    setMaterial(materiaisBase);
    setInstrucoes("Inclua duas questões dissertativas");
    setResultado(null);
    setError("");
    setLoading(false);
    setLoadingAssessment(false);
    router.replace("/confeccao", { scroll: false });
  };

  useEffect(() => {
    if (!editAssessmentId) {
      return;
    }

    const assessmentIdToLoad = editAssessmentId;
    let active = true;

    async function loadAssessment() {
      setLoadingAssessment(true);
      setError("");

      try {
        const response = await fetch(
          `/api/ia/assessments?assessmentId=${encodeURIComponent(
            assessmentIdToLoad,
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );
        const data = (await response.json()) as
          | AssessmentLookupResponse
          | {
              error?: string;
              message?: string;
            };

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "message" in data
                ? data.message
                : "Não foi possível carregar a avaliação.",
          );
        }

        const payload = data as AssessmentLookupResponse;
        const assessment = Array.isArray(payload.data)
          ? payload.data[0]
          : payload.data;

        if (!assessment) {
          throw new Error("Avaliação não encontrada.");
        }

        if (!active) {
          return;
        }

        const originalRequest = assessment.originalRequest;

        setMateria(originalRequest?.subject || "Ciências");
        setAnoEscolar(originalRequest?.gradeLevel || "6º ano");
        setTipoAvaliacao(originalRequest?.assessmentType || "prova");
        setQuantidadeQuestoes(originalRequest?.questionCount || 10);
        setDificuldade(originalRequest?.difficulty || "medio");
        setMaterial(originalRequest?.classroomMaterial || materiaisBase);
        setInstrucoes("");
        setResultado({ data: assessment });
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a avaliação.",
        );
      } finally {
        if (active) {
          setLoadingAssessment(false);
        }
      }
    }

    loadAssessment();

    return () => {
      active = false;
    };
  }, [editAssessmentId]);

  const gerarAvaliacao = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        isRevisionMode ? "/api/ia/revisions" : "/api/ia/assessments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(
            isRevisionMode
              ? { assessmentId, adjustmentRequest: instrucoes }
              : {
                  subject: materia,
                  gradeLevel: anoEscolar,
                  classroomMaterial: material,
                  assessmentType: tipoAvaliacao,
                  questionCount: quantidadeQuestoes,
                  difficulty: dificuldade,
                  teacherInstructions: instrucoes,
                },
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Não foi possível gerar a avaliação.",
        );
      }

      setResultado(data as AssessmentResponse);
      setInstrucoes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar a avaliação.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout active="confeccao">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Confecção de Provas</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0f3b63]">
            {isRevisionMode ? "Editar Prova" : "Confeccionar Prova"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRevisionMode
              ? "Revise as configurações e solicite os ajustes da avaliação."
              : "Configure o conteúdo e gere uma avaliação com apoio da IA."}
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {loadingAssessment && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-900 lg:col-span-2">
              Carregando avaliação para edição...
            </div>
          )}

          <section className=" h-fit rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a]">
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Configuração Base
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  {resumoConfiguracao}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* MATÉRIA */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Matéria
                </label>
                <input
                  type="text"
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  placeholder="Ex: Ciências, Matemática..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0f3b63] focus:bg-white focus:ring-3 focus:ring-blue-100"
                />
              </div>

              {/* DROPDOWN CUSTOMIZADO DE ANO ESCOLAR */}
              <div className="relative" ref={dropdownRef}>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <GraduationCap size={15} className="text-[#0f3b63]" />
                  Ano / Série Escolar
                </label>

                <button
                  type="button"
                  onClick={() => setIsGradeOpen(!isGradeOpen)}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 focus:border-[#0f3b63] focus:bg-white focus:ring-3 focus:ring-blue-100"
                >
                  <span>{anoEscolar}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isGradeOpen ? "rotate-180 text-[#0f3b63]" : ""
                    }`}
                  />
                </button>

                {isGradeOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    {gradeLevelsGrouped.map((group) => (
                      <div key={group.group} className="mb-2 last:mb-0">
                        <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 rounded-lg">
                          {group.group}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {group.options.map((option) => {
                            const isSelected = anoEscolar === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setAnoEscolar(option);
                                  setIsGradeOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  isSelected
                                    ? "bg-blue-50 text-[#0f3b63]"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <Check size={14} className="text-[#0f3b63]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PILLS TIPO DE AVALIAÇÃO */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Layers size={15} className="text-[#0f3b63]" />
                  Tipo de Avaliação
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {assessmentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = tipoAvaliacao === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setTipoAvaliacao(type.value)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 text-xs font-bold transition ${
                          isSelected
                            ? "border-[#0f3b63] bg-blue-50/80 text-[#0f3b63] shadow-xs"
                            : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTÕES E DIFICULDADE */}
              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Número de Questões
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantidadeQuestoes}
                    onChange={(e) =>
                      setQuantidadeQuestoes(Number(e.target.value))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0f3b63] focus:bg-white focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Gauge size={15} className="text-[#0f3b63]" />
                    Dificuldade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((diff) => {
                      const isSelected = dificuldade === diff.value;
                      return (
                        <button
                          key={diff.value}
                          type="button"
                          onClick={() => setDificuldade(diff.value)}
                          className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                            isSelected
                              ? "border-[#0f3b63] bg-[#0f3b63] text-white shadow-xs"
                              : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {diff.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
              <div className="mb-1.5 flex items-center gap-1.5 font-bold text-[#0f3b63]">
                <Sparkles size={16} />
                Inteligência Artificial Khora
              </div>
              <p className="leading-relaxed text-slate-600">
                Sua prova será gerada com alinhamento pedagógico ao ano escolar
                e dificuldade selecionados.
              </p>
            </div>

            {isRevisionMode && (
              <button
                type="button"
                onClick={reiniciarConfeccao}
                disabled={loading || loadingAssessment}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Reiniciar Confecção
              </button>
            )}
          </section>

          {/* PAINEL DIREITO: CONTEÚDO E PREVIEW */}
          <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isRevisionMode
                    ? "Ajustes da Avaliação"
                    : "Material de Apoio e Contexto"}
                </h2>
                {!isRevisionMode && (
                  <p className="text-xs font-medium text-slate-400">
                    Insira o texto ou resumo da aula que servirá de base.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {!isRevisionMode && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Material de Aula / Conteúdo
                  </label>
                  <textarea
                    rows={6}
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full min-h-[160px] resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-[#0f3b63] focus:bg-white focus:ring-3 focus:ring-blue-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Instruções Adicionais
                </label>
                <textarea
                  rows={isRevisionMode ? 6 : 3}
                  value={instrucoes}
                  onChange={(e) => setInstrucoes(e.target.value)}
                  placeholder={
                    isRevisionMode
                      ? "Ex.: Substitua a questão 2 por uma questão sobre evaporação."
                      : "Ex.: Inclua questões com pegadinhas, foque no processo X..."
                  }
                  className="min-h-[90px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-[#0f3b63] focus:bg-white focus:ring-3 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={gerarAvaliacao}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3b63] py-3.5 px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#0a2845] disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    <span>
                      {isRevisionMode ? "Revisando..." : "Gerando Avaliação..."}
                    </span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>
                      {isRevisionMode
                        ? "Gerar Revisão com IA"
                        : "Gerar Avaliação com IA"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {resultado && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <AssessmentPreview
                  assessment={resultado.data.currentVersion.assessment}
                />
              </div>
            )}
          </section>
        </div>
      </section>
    </AppLayout>
  );
}
