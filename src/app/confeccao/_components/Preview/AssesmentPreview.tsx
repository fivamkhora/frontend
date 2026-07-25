import { useEffect, useMemo, useState } from "react";
import {
  AssessmentData,
  normalizeAnswers,
  NormalizedAnswer,
  NormalizedQuestion,
  normalizeQuestions,
} from "../ConfeccaoProvasContent";
import { Printer, Shuffle } from "lucide-react";
import QuestionsView from "./QuestionView";
import AnswersView from "./AnswersView";

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

export function AssessmentPreview({
  assessment,
}: {
  assessment: AssessmentData;
}) {
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
