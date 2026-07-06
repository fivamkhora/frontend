"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LoaderCircle,
  Printer,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

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
    versions: unknown[];
  };
};

type AssessmentLookupResponse = {
  data: AssessmentResponse["data"] | AssessmentResponse["data"][];
};

type AssessmentData = AssessmentResponse["data"]["currentVersion"]["assessment"];

type NormalizedOption = {
  letter: string;
  text: string;
  selected: boolean;
};

type NormalizedQuestion = {
  number: string;
  sourceNumber: string;
  statement: string;
  options: NormalizedOption[];
  points: string;
  type: string;
};

type NormalizedAnswer = {
  number: string;
  answer: string;
  rubric: string;
};

const assessmentTypes = [
  { label: "Prova", value: "prova" },
  { label: "Quiz", value: "quiz" },
  { label: "Trabalho", value: "trabalho" },
] as const;

const difficulties = [
  { label: "Fácil", value: "facil" },
  { label: "Médio", value: "medio" },
  { label: "Difícil", value: "dificil" },
] as const;

const materiaisBase =
  "O ciclo da água é o movimento contínuo da água em nosso planeta. Ele envolve processos como a evaporação, passagem do estado líquido para o gasoso devido ao calor do Sol, condensação, formação de nuvens, e precipitação, chuva. A água também infiltra no solo, alimentando lençóis freáticos.";

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

function normalizeAnswer(answer: unknown, index: number): NormalizedAnswer {
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
      "Resposta nao informada.",
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

function normalizeOptions(question: unknown, selectedAnswer: string) {
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
        (selectedAnswer === normalizedLetter || selectedAnswer === normalizedText),
    };
  });
}

function normalizeQuestions(assessment: AssessmentData): NormalizedQuestion[] {
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

function normalizeAnswers(assessment: AssessmentData): NormalizedAnswer[] {
  return assessment.answerKey.map(normalizeAnswer);
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];

    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

function randomizeQuestions(questions: NormalizedQuestion[]) {
  return shuffleArray(questions).map((question, questionIndex) => ({
    ...question,
    number: String(questionIndex + 1).padStart(2, "0"),
    options: shuffleArray(question.options).map((option, optionIndex) => ({
      ...option,
      letter: String.fromCharCode(65 + optionIndex),
    })),
  }));
}

function buildAnswersFromQuestions(
  questions: NormalizedQuestion[],
  originalAnswers: NormalizedAnswer[],
): NormalizedAnswer[] {
  const answersBySourceNumber = new Map(
    originalAnswers.map((answer) => [answer.number, answer]),
  );

  return questions.map((question) => {
    const selectedOption = question.options.find((option) => option.selected);
    const originalAnswer = answersBySourceNumber.get(question.sourceNumber);

    return {
      number: question.number,
      answer:
        selectedOption?.letter ||
        originalAnswer?.answer ||
        "Resposta nao informada.",
      rubric: originalAnswer?.rubric || "",
    };
  });
}

export function ConfeccaoProvasContent({
  assessmentIdToEdit,
}: {
  assessmentIdToEdit?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editAssessmentId = assessmentIdToEdit ?? searchParams.get("id");
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
        const data = (await response.json()) as AssessmentLookupResponse | {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "message" in data
                ? data.message
                : "Nao foi possivel carregar a avaliacao.",
          );
        }

        const payload = data as AssessmentLookupResponse;
        const assessment = Array.isArray(payload.data)
          ? payload.data[0]
          : payload.data;

        if (!assessment) {
          throw new Error("Avaliacao nao encontrada.");
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
            : "Nao foi possivel carregar a avaliacao.",
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
              ? {
                  assessmentId,
                  adjustmentRequest: instrucoes,
                }
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

      const data = (await response.json()) as AssessmentResponse | {
        error?: string;
        message?: string;
        upstreamStatus?: number;
        upstreamPath?: string;
      };

      if (!response.ok) {
        const upstreamDetail =
          "upstreamStatus" in data && data.upstreamStatus
            ? ` BFF respondeu ${data.upstreamStatus}${
                data.upstreamPath ? ` em ${data.upstreamPath}` : ""
              }.`
            : "";

        throw new Error(
          "error" in data
            ? `${data.error}${upstreamDetail}`
            : "message" in data
              ? data.message
              : "Nao foi possivel gerar a avaliacao.",
        );
      }

      setResultado(data as AssessmentResponse);
      setInstrucoes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel gerar a avaliacao.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout active="confeccao">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[380px_1fr] md:px-8">
        {loadingAssessment && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-900 md:col-span-2">
            Carregando avaliação para edição...
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Configuração Base
              </h1>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {resumoConfiguracao}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Matéria
              </span>
              <input
                type="text"
                value={materia}
                onChange={(event) => setMateria(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ano Escolar
              </span>
              <select
                value={anoEscolar}
                onChange={(event) => setAnoEscolar(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>6º ano</option>
                <option>7º ano</option>
                <option>8º ano</option>
                <option>9º ano</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tipo de Avaliação
              </span>
              <select
                value={tipoAvaliacao}
                onChange={(event) => setTipoAvaliacao(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {assessmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Questões
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantidadeQuestoes}
                  onChange={(event) =>
                    setQuantidadeQuestoes(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Dificuldade
                </span>
                <select
                  value={dificuldade}
                  onChange={(event) => setDificuldade(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Sparkles size={18} />
              Otimização com IA
            </div>
            <p className="leading-relaxed text-blue-900">
              Sua avaliação será otimizada com a inteligência artificial da
              Khora.
            </p>
          </div>

          {isRevisionMode && (
            <button
              type="button"
              onClick={reiniciarConfeccao}
              disabled={loading || loadingAssessment}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1e3a8a] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <RotateCcw size={17} />
              Reiniciar confecção
            </button>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {isRevisionMode ? "Ajustes da Avaliação" : "Material e Contexto"}
              </h2>
              {!isRevisionMode && (
                <p className="text-sm text-slate-500">
                  Base de conteúdo usada para gerar a prova.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {!isRevisionMode && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Material de Aula Conteúdo
                </span>
                <textarea
                  rows={8}
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                  className="min-h-48 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Instruções Adicionais
              </span>
              <textarea
                rows={isRevisionMode ? 6 : 3}
                value={instrucoes}
                onChange={(event) => setInstrucoes(event.target.value)}
                placeholder={
                  isRevisionMode
                    ? "Ex.: Troque a questão 2 aberta por uma questão de múltipla escolha."
                    : "Inclua orientações para a geração da avaliação."
                }
                className="min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={gerarAvaliacao}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#123a60] disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  {isRevisionMode ? "Revisando avaliação..." : "Gerando avaliação..."}
                </>
              ) : (
                <>
                  <FileText size={18} />
                  {isRevisionMode
                    ? "Gerar Revisão com IA"
                    : "Gerar Avaliação com IA"}
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {resultado && (
            <AssessmentPreview
              assessment={resultado.data.currentVersion.assessment}
            />
          )}
        </section>
      </section>
    </AppLayout>
  );
}

function AssessmentPreview({ assessment }: { assessment: AssessmentData }) {
  const [activeTab, setActiveTab] = useState<"questions" | "answers">(
    "questions",
  );
  const originalQuestions = useMemo(
    () => normalizeQuestions(assessment),
    [assessment],
  );
  const originalAnswers = useMemo(
    () => normalizeAnswers(assessment),
    [assessment],
  );
  const [questions, setQuestions] = useState(originalQuestions);
  const answers = useMemo(
    () => buildAnswersFromQuestions(questions, originalAnswers),
    [originalAnswers, questions],
  );

  useEffect(() => {
    setQuestions(originalQuestions);
    setActiveTab("questions");
  }, [originalQuestions]);

  const randomizarProva = () => {
    setQuestions((currentQuestions) => randomizeQuestions(currentQuestions));
    setActiveTab("questions");
  };

  const imprimir = (mode: "questions" | "answers") => {
    const printingClass =
      mode === "questions" ? "print-questions" : "print-answers";

    setActiveTab(mode);
    document.body.classList.add("assessment-printing", printingClass);

    const cleanup = () => {
      document.body.classList.remove("assessment-printing", printingClass);
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(cleanup, 500);
    }, 50);
  };

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-100 p-3 md:p-5">
      <style>{`
        @media print {
          body.assessment-printing * {
            visibility: hidden !important;
          }

          body.assessment-printing .assessment-print-area,
          body.assessment-printing .assessment-print-area * {
            visibility: visible !important;
          }

          body.assessment-printing .assessment-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            border: 0 !important;
            box-shadow: none !important;
            padding: 24px !important;
          }

          body.assessment-printing .assessment-preview-controls {
            display: none !important;
          }

          body.print-questions .questions-only {
            display: block !important;
          }

          body.print-questions .answers-only,
          body.print-answers .questions-only {
            display: none !important;
          }

          body.print-answers .answers-only {
            display: block !important;
          }
        }
      `}</style>

      <div className="assessment-preview-controls mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={randomizarProva}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1e3a8a]"
        >
          <Shuffle size={16} />
          Randomizar prova
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => imprimir("questions")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123a60]"
          >
            <Printer size={16} />
            Imprimir prova
          </button>
          <button
            type="button"
            onClick={() => imprimir("answers")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1e3a8a] transition hover:border-blue-200 hover:bg-blue-50"
          >
            <Printer size={16} />
            Imprimir respostas
          </button>
        </div>
      </div>

      <div className="assessment-print-area mx-auto max-w-3xl rounded-md border border-slate-300 bg-white p-5 text-slate-950 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <strong className="text-sm">Nome:</strong>
            <span className="h-6 flex-1 border-b border-slate-400" />
          </div>

          <div className="flex items-end gap-2">
            <strong className="text-sm">Data:</strong>
            <span className="text-sm text-slate-700">___/___/___</span>
          </div>
        </div>

        <h3 className="mb-3 text-center text-xl font-bold">
          {assessment.title}
        </h3>

        <section className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
          {assessment.instructions ||
            "Leia com atenção cada questão antes de responder. Utilize caneta azul ou preta."}
        </section>

        <div className="assessment-preview-controls mb-6 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "questions"
                ? "bg-white text-[#1e3a8a] shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Questões
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("answers")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "answers"
                ? "bg-white text-[#1e3a8a] shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Respostas
          </button>
        </div>

        <div
          className={`questions-only ${
            activeTab === "questions" ? "block" : "hidden"
          }`}
        >
          <QuestionsView questions={questions} />
        </div>

        <div
          className={`answers-only ${
            activeTab === "answers" ? "block" : "hidden"
          }`}
        >
          <AnswersView answers={answers} />
        </div>
      </div>
    </section>
  );
}

function QuestionsView({ questions }: { questions: NormalizedQuestion[] }) {
  return (
    <div className="space-y-5">
      {questions.map((question) => (
        <section
          key={question.number}
          className="rounded-md border border-slate-200 bg-white p-4"
        >
          <div className="mb-4 grid grid-cols-[44px_1fr] gap-3">
            <div className="font-bold text-[#1e3a8a]">{question.number}.</div>
            <div>
              <div className="text-sm font-medium leading-6 text-slate-900">
                {question.statement}
              </div>
              {(question.type || question.points) && (
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {[question.type, question.points && `${question.points} ponto(s)`]
                    .filter(Boolean)
                    .join(" | ")}
                </div>
              )}
            </div>
          </div>

          {question.options.length > 0 ? (
            <div className="ml-0 grid gap-2 sm:ml-14">
              {question.options.map((option) => (
                <div
                  key={`${question.number}-${option.letter}`}
                  className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                    {option.letter}
                  </span>
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-0 space-y-4 pt-1 sm:ml-14">
              <div className="border-b border-slate-300 pt-6" />
              <div className="border-b border-slate-300 pt-6" />
              <div className="border-b border-slate-300 pt-6" />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function AnswersView({ answers }: { answers: NormalizedAnswer[] }) {
  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <section
          key={answer.number}
          className="rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
              {answer.number}
            </span>
            <div className="text-sm font-bold text-slate-950">
              Resposta: {answer.answer}
            </div>
          </div>

          {answer.rubric && (
            <p className="text-sm leading-6 text-slate-700">
              <strong>Critério:</strong> {answer.rubric}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}

