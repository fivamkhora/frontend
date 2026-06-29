"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  LoaderCircle,
  Menu,
  Sparkles,
} from "lucide-react";

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

    return {
      number: number.padStart(2, "0"),
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

export default function ConfeccaoProvasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] text-sm font-medium text-slate-600">
          Carregando confecção de provas...
        </div>
      }
    >
      <ConfeccaoProvasContent />
    </Suspense>
  );
}

function ConfeccaoProvasContent() {
  const searchParams = useSearchParams();
  const editAssessmentId = searchParams.get("id");
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
          `/api/assessments?assessmentId=${encodeURIComponent(
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
        isRevisionMode ? "/api/revisions" : "/api/assessments",
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
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold text-[#1e3a8a]"
            >
              <Brain size={24} />
              <span>Khora AI</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 hover:bg-slate-100 hover:text-slate-900"
            >
              Início
            </Link>
            <Link
              href="/confeccao"
              className="rounded-lg bg-[#1e3a8a] px-4 py-2 text-white shadow-sm"
            >
              Provas
            </Link>
            <Link
              href="/provas"
              className="rounded-lg px-4 py-2 hover:bg-slate-100 hover:text-slate-900"
            >
              Listagem de provas criadas
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[380px_1fr] md:px-8 md:py-8">
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
      </main>
    </div>
  );
}

function AssessmentPreview({ assessment }: { assessment: AssessmentData }) {
  const [activeTab, setActiveTab] = useState<"questions" | "answers">(
    "questions",
  );
  const questions = normalizeQuestions(assessment);
  const answers = normalizeAnswers(assessment);

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-slate-100 p-3 md:p-5">
      <div className="mx-auto max-w-3xl rounded-md border border-slate-300 bg-white p-5 text-slate-950 shadow-sm md:p-8">
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

        <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
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

        {activeTab === "questions" ? (
          <QuestionsView questions={questions} />
        ) : (
          <AnswersView answers={answers} />
        )}
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
