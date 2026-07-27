"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  GraduationCap,
  HelpCircle,
  LoaderCircle,
  Save,
  Send,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Alternative = {
  label: string;
  text: string;
};

type ExamQuestion = {
  alternatives?: Alternative[];
  difficulty: "Fácil" | "Média" | "Difícil";
  id: string;
  number: number;
  points: number;
  statement: string;
  subject: string;
  type: "ESSAY" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
};

type AnswerMap = Record<string, string>;

const questions: ExamQuestion[] = [
  {
    alternatives: [
      { label: "A", text: "Foi definido de uma única vez e nunca mudou." },
      {
        label: "B",
        text: "Resultou de processos históricos de ocupação e expansão.",
      },
      { label: "C", text: "Formou-se apenas por decisões recentes." },
      { label: "D", text: "Não possui relação com acontecimentos históricos." },
      { label: "E", text: "Ocorreu exclusivamente por migrações internas." },
    ],
    difficulty: "Média",
    id: "q1",
    number: 1,
    points: 1,
    statement:
      "Qual alternativa descreve melhor a formação do território brasileiro?",
    subject: "Formação territorial",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "Impedir comparações entre áreas do país." },
      {
        label: "B",
        text: "Facilitar o estudo de áreas com características semelhantes.",
      },
      { label: "C", text: "Eliminar as diferenças entre as regiões." },
      { label: "D", text: "Substituir estados e municípios." },
      { label: "E", text: "Evitar estudos populacionais e econômicos." },
    ],
    difficulty: "Fácil",
    id: "q2",
    number: 2,
    points: 1,
    statement:
      "Qual é uma finalidade correta da regionalização do território brasileiro?",
    subject: "Regionalização",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "É distribuída igualmente pelo território." },
      {
        label: "B",
        text: "Concentra-se em algumas áreas por fatores históricos e econômicos.",
      },
      { label: "C", text: "Não se altera ao longo do tempo." },
      { label: "D", text: "Não possui relação com a economia." },
      { label: "E", text: "Vive exclusivamente em áreas rurais." },
    ],
    difficulty: "Média",
    id: "q3",
    number: 3,
    points: 1,
    statement:
      "Sobre a distribuição da população brasileira, assinale a alternativa correta.",
    subject: "População",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "Aumento da população vivendo no campo." },
      {
        label: "B",
        text: "Crescimento das cidades e aumento da população urbana.",
      },
      { label: "C", text: "Redução das cidades e da população urbana." },
      { label: "D", text: "Processo restrito a um único estado." },
      { label: "E", text: "Mudança sem relação com trabalho e serviços." },
    ],
    difficulty: "Fácil",
    id: "q4",
    number: 4,
    points: 1,
    statement: "Qual alternativa define corretamente urbanização?",
    subject: "Urbanização",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "Não dependem de recursos ou localização." },
      {
        label: "B",
        text: "Podem se concentrar onde há recursos, infraestrutura e mercado.",
      },
      { label: "C", text: "São idênticas em todas as regiões." },
      { label: "D", text: "Não influenciam o crescimento das cidades." },
      { label: "E", text: "Não possuem relação com o trabalho." },
    ],
    difficulty: "Média",
    id: "q5",
    number: 5,
    points: 1,
    statement:
      "Como as atividades econômicas podem se relacionar com o território?",
    subject: "Atividades econômicas",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "V", text: "Verdadeiro" },
      { label: "F", text: "Falso" },
    ],
    difficulty: "Fácil",
    id: "q6",
    number: 6,
    points: 1,
    statement:
      "A regionalização pode considerar aspectos naturais, sociais e econômicos.",
    subject: "Regionalização",
    type: "TRUE_FALSE",
  },
  {
    alternatives: [
      { label: "A", text: "Cidades não concentram empregos ou serviços." },
      {
        label: "B",
        text: "Cidades concentram atividades e serviços, atraindo população.",
      },
      { label: "C", text: "Urbanização ocorre apenas sem empregos." },
      { label: "D", text: "Urbanização sempre reduz serviços." },
      { label: "E", text: "Economia não influencia urbanização." },
    ],
    difficulty: "Média",
    id: "q7",
    number: 7,
    points: 1,
    statement:
      "Qual relação entre cidades, atividades econômicas e população está correta?",
    subject: "Urbanização",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "O território é ocupado de maneira idêntica." },
      {
        label: "B",
        text: "Há diferenças ligadas à história e às atividades econômicas.",
      },
      { label: "C", text: "A ocupação não possui relação com a história." },
      { label: "D", text: "A organização depende apenas do clima." },
      { label: "E", text: "Não existem variações regionais no Brasil." },
    ],
    difficulty: "Média",
    id: "q8",
    number: 8,
    points: 1,
    statement:
      "Qual alternativa explica melhor as diferentes formas de ocupação do território brasileiro?",
    subject: "Território",
    type: "MULTIPLE_CHOICE",
  },
  {
    alternatives: [
      { label: "A", text: "Não altera a distribuição populacional." },
      {
        label: "B",
        text: "Pode aumentar a população urbana e modificar sua distribuição.",
      },
      { label: "C", text: "Sempre diminui a população das cidades." },
      { label: "D", text: "Impede o crescimento urbano." },
      { label: "E", text: "Não se relaciona com moradia e serviços." },
    ],
    difficulty: "Média",
    id: "q9",
    number: 9,
    points: 1,
    statement:
      "Como a urbanização pode influenciar a distribuição da população?",
    subject: "População urbana",
    type: "MULTIPLE_CHOICE",
  },
  {
    difficulty: "Difícil",
    id: "q10",
    number: 10,
    points: 1,
    statement:
      "Explique como população, urbanização e atividades econômicas ajudam a compreender as diferenças entre as regiões brasileiras.",
    subject: "Síntese",
    type: "ESSAY",
  },
];

const exam = {
  instructions:
    "Leia cada questão com atenção. As respostas são salvas automaticamente nesta demonstração.",
  student: { classroom: "7º Ano A", name: "José Aluno Exemplo" },
  subject: "Geografia",
  title: "Avaliação de Geografia - Território Brasileiro",
  totalTimeMinutes: 90,
};

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function QuestionMapButton({
  active,
  answered,
  flagged,
  number,
  onClick,
}: {
  active: boolean;
  answered: boolean;
  flagged: boolean;
  number: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ir para a questão ${number}`}
      className={`relative flex h-11 items-center justify-center rounded-lg border text-sm font-bold transition ${
        active
          ? "border-[#00355f] bg-[#00355f] text-white"
          : answered
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
      }`}
    >
      {answered && !active ? <Check size={15} /> : number}
      {flagged && (
        <Flag
          size={11}
          className="absolute right-1 top-1 fill-amber-500 text-amber-500"
        />
      )}
    </button>
  );
}

function FinishModal({
  answeredCount,
  finishing,
  onCancel,
  onConfirm,
}: {
  answeredCount: number;
  finishing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Finalizar prova</h2>
            <p className="mt-1 text-sm text-slate-500">
              Confira o resumo antes de enviar.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={finishing}
            aria-label="Fechar confirmação"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {answeredCount}
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                Respondidas
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{unanswered}</p>
              <p className="text-xs font-semibold text-amber-700">
                Não respondidas
              </p>
            </div>
          </div>

          {unanswered > 0 && (
            <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <p className="text-sm leading-5 text-amber-800">
                Existem questões sem resposta. Após finalizar, não será
                possível alterar a prova.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={finishing}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Continuar respondendo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={finishing}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#00355f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0f4c81] disabled:opacity-60"
          >
            {finishing ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {finishing ? "Enviando..." : "Confirmar envio"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(
    exam.totalTimeMinutes * 60,
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]?.trim()).length,
    [answers],
  );
  const progress = Math.round((answeredCount / questions.length) * 100);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !submitted) {
      setShowFinishModal(true);
    }
  }, [remainingSeconds, submitted]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  function scheduleSave() {
    setSaveStatus("saving");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 600);
  }

  function handleAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
    scheduleSave();
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= questions.length) {
      return;
    }

    setCurrentIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFlag() {
    setFlaggedQuestionIds((current) =>
      current.includes(currentQuestion.id)
        ? current.filter((id) => id !== currentQuestion.id)
        : [...current, currentQuestion.id],
    );
  }

  async function finishExam() {
    setFinishing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setFinishing(false);
    setShowFinishModal(false);
    setSubmitted(true);
  }

  const flagged = flaggedQuestionIds.includes(currentQuestion.id);
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/aluno/provas"
            aria-label="Voltar para minhas provas"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f4c81] text-white">
            <GraduationCap size={19} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#00355f]">
              {exam.title}
            </p>
            <p className="truncate text-xs text-slate-500">
              Prova mockada · {examId}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
              remainingSeconds <= 300
                ? "bg-red-100 text-red-700"
                : "bg-blue-50 text-[#00355f]"
            }`}
          >
            <Clock3 size={17} />
            <span className="tabular-nums">{formatTime(remainingSeconds)}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              window.alert(
                "Selecione uma alternativa ou escreva sua resposta. O salvamento é automático.",
              )
            }
            aria-label="Ajuda"
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-72 shrink-0 border-r border-slate-200 bg-slate-50 p-5 lg:block">
          <h2 className="font-bold text-[#00355f]">Mapa de questões</h2>
          <p className="mt-1 text-xs text-slate-500">
            {answeredCount} de {questions.length} respondidas
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#00355f] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <nav className="mt-6 grid grid-cols-5 gap-2">
            {questions.map((question, index) => (
              <QuestionMapButton
                key={question.id}
                active={index === currentIndex}
                answered={Boolean(answers[question.id]?.trim())}
                flagged={flaggedQuestionIds.includes(question.id)}
                number={question.number}
                onClick={() => goToQuestion(index)}
              />
            ))}
          </nav>
          <div className="mt-6 space-y-2 text-xs text-slate-500">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-emerald-100" /> Respondida
            </p>
            <p className="flex items-center gap-2">
              <Flag size={13} className="text-amber-500" /> Marcada para revisão
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 overflow-x-auto lg:hidden">
              <nav className="grid min-w-[500px] grid-cols-10 gap-2">
                {questions.map((question, index) => (
                  <QuestionMapButton
                    key={question.id}
                    active={index === currentIndex}
                    answered={Boolean(answers[question.id]?.trim())}
                    flagged={flaggedQuestionIds.includes(question.id)}
                    number={question.number}
                    onClick={() => goToQuestion(index)}
                  />
                ))}
              </nav>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>Questão {currentQuestion.number}</span>
                    <span>·</span>
                    <span>{currentQuestion.points} ponto</span>
                    <span>·</span>
                    <span>{currentQuestion.difficulty}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase text-[#0f4c81]">
                    {currentQuestion.subject}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold ${
                    flagged
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Flag size={15} className={flagged ? "fill-current" : ""} />
                  {flagged ? "Marcada" : "Revisar depois"}
                </button>
              </div>

              <h1 className="mt-6 text-lg font-semibold leading-8 text-slate-900 sm:text-xl">
                {currentQuestion.statement}
              </h1>

              {currentQuestion.type === "ESSAY" ? (
                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Sua resposta
                  </span>
                  <textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(event) => handleAnswer(event.target.value)}
                    rows={9}
                    placeholder="Escreva sua resposta..."
                    className="w-full resize-y rounded-lg border border-slate-300 p-4 text-sm leading-6 outline-none focus:border-[#0f4c81] focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ) : (
                <div className="mt-6 space-y-3">
                  {currentQuestion.alternatives?.map((alternative) => {
                    const selected =
                      answers[currentQuestion.id] === alternative.label;

                    return (
                      <button
                        key={alternative.label}
                        type="button"
                        onClick={() => handleAnswer(alternative.label)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                          selected
                            ? "border-[#0f4c81] bg-blue-50 ring-1 ring-[#0f4c81]"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                            selected
                              ? "border-[#0f4c81] bg-[#0f4c81] text-white"
                              : "border-slate-300 text-slate-600"
                          }`}
                        >
                          {selected ? <Check size={16} /> : alternative.label}
                        </span>
                        <span className="pt-1 text-sm leading-6 text-slate-700">
                          {alternative.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={17} /> Anterior
              </button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#00355f] px-4 text-sm font-bold text-[#00355f] hover:bg-blue-50"
                >
                  <Send size={17} /> Finalizar prova
                </button>
                {!isLastQuestion && (
                  <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00355f] px-4 text-sm font-bold text-white hover:bg-[#0f4c81]"
                  >
                    Próxima <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              {saveStatus === "saving" ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saveStatus === "saving"
                ? "Salvando resposta..."
                : "Respostas salvas automaticamente"}
            </div>
          </div>
        </main>
      </div>

      {showFinishModal && (
        <FinishModal
          answeredCount={answeredCount}
          finishing={finishing}
          onCancel={() => setShowFinishModal(false)}
          onConfirm={finishExam}
        />
      )}

      {submitted && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-7 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Prova enviada
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A entrega mockada foi registrada com {answeredCount} de {questions.length}{" "}
              questões respondidas.
            </p>
            <Link
              href="/aluno/provas"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#00355f] px-5 text-sm font-bold text-white hover:bg-[#0f4c81]"
            >
              Voltar para minhas provas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
