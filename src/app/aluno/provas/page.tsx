"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  PlayCircle,
  Search,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

type ExamStatus = "PENDING" | "COMPLETED" | "RESULT";
type Tab = "pending" | "completed" | "results";

type Exam = {
  availableAt: string;
  classroom: string;
  deadlineAt: string;
  durationMinutes: number;
  id: string;
  questionCount: number;
  score?: number;
  status: ExamStatus;
  subject: string;
  submittedAt?: string;
  teacher: string;
  title: string;
  totalScore?: number;
  urgency?: "URGENT" | "NORMAL";
};

const exams: Exam[] = [
  {
    availableAt: "26/07/2026 às 08:00",
    classroom: "7º Ano A",
    deadlineAt: "28/07/2026 às 18:00",
    durationMinutes: 90,
    id: "767a2807-f5d8-4e97-aca3-273920ac3d75",
    questionCount: 10,
    status: "PENDING",
    subject: "Geografia",
    teacher: "Ana Ferreira",
    title: "Avaliação de Geografia - Território Brasileiro",
    urgency: "URGENT",
  },
  {
    availableAt: "29/07/2026 às 08:00",
    classroom: "7º Ano A",
    deadlineAt: "31/07/2026 às 17:00",
    durationMinutes: 60,
    id: "375c78da-c145-46db-8fcb-f33fa180ce13",
    questionCount: 12,
    status: "PENDING",
    subject: "Matemática",
    teacher: "Maria Aparecida",
    title: "Prova de Matemática - Equações",
    urgency: "NORMAL",
  },
  {
    availableAt: "01/08/2026 às 09:00",
    classroom: "7º Ano A",
    deadlineAt: "04/08/2026 às 18:00",
    durationMinutes: 45,
    id: "dc17fc95-4069-46f9-82dd-729a70ff50b0",
    questionCount: 8,
    status: "PENDING",
    subject: "Ciências",
    teacher: "Helena Souza",
    title: "Atividade de Ciências - Sistema Solar",
    urgency: "NORMAL",
  },
  {
    availableAt: "10/07/2026 às 08:00",
    classroom: "7º Ano A",
    deadlineAt: "12/07/2026 às 18:00",
    durationMinutes: 60,
    id: "78d5a270-24ca-44cb-895f-a620ad96e3bc",
    questionCount: 10,
    status: "COMPLETED",
    subject: "Português",
    submittedAt: "11/07/2026 às 14:32",
    teacher: "João Santos",
    title: "Avaliação de Português - Interpretação Textual",
  },
  {
    availableAt: "02/07/2026 às 08:00",
    classroom: "7º Ano A",
    deadlineAt: "05/07/2026 às 18:00",
    durationMinutes: 75,
    id: "a3ee346d-5c63-465f-bf20-a5b7f43c1ef7",
    questionCount: 10,
    score: 8.5,
    status: "RESULT",
    subject: "História",
    submittedAt: "04/07/2026 às 10:20",
    teacher: "Ricardo Lima",
    title: "Prova de História - Brasil Colônia",
    totalScore: 10,
  },
  {
    availableAt: "20/06/2026 às 08:00",
    classroom: "7º Ano A",
    deadlineAt: "22/06/2026 às 18:00",
    durationMinutes: 50,
    id: "b8d1934b-bddd-4852-828c-8ec5f7dedfe2",
    questionCount: 10,
    score: 9.2,
    status: "RESULT",
    subject: "Ciências",
    submittedAt: "21/06/2026 às 09:15",
    teacher: "Helena Souza",
    title: "Simulado de Ciências - Ecossistemas",
    totalScore: 10,
  },
];

const tabStatus: Record<Tab, ExamStatus> = {
  completed: "COMPLETED",
  pending: "PENDING",
  results: "RESULT",
};

const tabLabels: Record<Tab, string> = {
  completed: "Realizadas",
  pending: "Pendentes",
  results: "Resultados",
};

const tabs: Tab[] = ["pending", "completed", "results"];

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
        <div className="text-[#0f4c81]">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#00355f]">{value}</p>
    </article>
  );
}

function ExamInformation({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StatusBadge({ exam }: { exam: Exam }) {
  if (exam.status === "PENDING") {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          exam.urgency === "URGENT"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-[#00355f]"
        }`}
      >
        {exam.urgency === "URGENT" ? "Urgente" : "Pendente"}
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        exam.status === "RESULT"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {exam.status === "RESULT" ? "Corrigida" : "Enviada"}
    </span>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const isPending = exam.status === "PENDING";
  const hasResult = exam.status === "RESULT";

  return (
    <Link
      href={`/aluno/provas/${encodeURIComponent(exam.id)}/realizar`}
      aria-label={`Abrir ${exam.title}`}
      className="flex min-h-[330px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-start justify-between gap-4">
        <StatusBadge exam={exam} />
        <div
          className={`rounded-lg p-2 ${
            exam.urgency === "URGENT"
              ? "bg-red-50 text-red-600"
              : hasResult
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-[#0f4c81]"
          }`}
        >
          {isPending ? (
            <Clock3 size={19} />
          ) : hasResult ? (
            <Award size={19} />
          ) : (
            <FileCheck2 size={19} />
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase text-[#0f4c81]">
          {exam.subject}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-6 text-slate-900">
          {exam.title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Prof. {exam.teacher} · {exam.classroom}
        </p>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
        {isPending ? (
          <>
            <ExamInformation
              icon={<CalendarDays size={16} />}
              text={`Disponível: ${exam.availableAt}`}
            />
            <ExamInformation
              icon={<AlertCircle size={16} />}
              text={`Data limite: ${exam.deadlineAt}`}
            />
          </>
        ) : (
          <ExamInformation
            icon={<CheckCircle2 size={16} />}
            text={`Enviada em: ${exam.submittedAt}`}
          />
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <ExamInformation
            icon={<Clock3 size={16} />}
            text={`${exam.durationMinutes} minutos`}
          />
          <ExamInformation
            icon={<BookOpen size={16} />}
            text={`${exam.questionCount} questões`}
          />
        </div>
      </div>

      {hasResult && (
        <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase text-emerald-700">
            Resultado
          </p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold text-emerald-700">
              {exam.score?.toFixed(1)}
            </p>
            <p className="text-sm font-semibold text-emerald-700">
              de {exam.totalScore?.toFixed(1)} pontos
            </p>
          </div>
        </div>
      )}

      <span
        className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition ${
          isPending
            ? "bg-[#00355f] text-white hover:bg-[#0f4c81]"
            : "border border-[#00355f] text-[#00355f] hover:bg-blue-50"
        }`}
      >
        {isPending ? (
          <PlayCircle size={18} />
        ) : hasResult ? (
          <BarChart3 size={18} />
        ) : (
          <FileCheck2 size={18} />
        )}
        {isPending ? "Iniciar prova" : hasResult ? "Ver resultado" : "Ver envio"}
      </span>
    </Link>
  );
}

export default function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      completed: exams.filter((exam) => exam.status === "COMPLETED").length,
      pending: exams.filter((exam) => exam.status === "PENDING").length,
      results: exams.filter((exam) => exam.status === "RESULT").length,
    }),
    [],
  );

  const average = useMemo(() => {
    const gradedExams = exams.filter(
      (exam) => exam.status === "RESULT" && typeof exam.score === "number",
    );
    const total = gradedExams.reduce((sum, exam) => sum + (exam.score ?? 0), 0);

    return gradedExams.length ? total / gradedExams.length : 0;
  }, []);

  const visibleExams = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    return exams.filter((exam) => {
      const matchesTab = exam.status === tabStatus[activeTab];
      const matchesSearch =
        !term ||
        [exam.title, exam.subject, exam.teacher].some((value) =>
          value.toLocaleLowerCase("pt-BR").includes(term),
        );

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  const completedCount = counts.completed + counts.results;
  const progress = Math.round((completedCount / exams.length) * 100);

  return (
    <AppLayout active="provasAluno">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Painel</span>
                <span>&gt;</span>
                <span className="text-[#1e3a8a]">Minhas provas</span>
              </div>
              <p className="mb-2 text-xs font-bold uppercase text-[#0f4c81]">
                7º Ano A
              </p>
              <h1 className="text-3xl font-bold text-[#0f3b63]">
                Minhas provas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe suas avaliações, prazos e resultados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[480px]">
              <SummaryCard
                title="Pendentes"
                value={String(counts.pending).padStart(2, "0")}
                icon={<AlertCircle size={18} />}
              />
              <SummaryCard
                title="Média geral"
                value={average.toFixed(1)}
                icon={<Award size={18} />}
              />
              <div className="col-span-2 sm:col-span-1">
                <SummaryCard
                  title="Progresso"
                  value={`${progress}%`}
                  icon={<BarChart3 size={18} />}
                />
              </div>
            </div>
          </header>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="flex h-11 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500 focus-within:bg-white">
              <Search size={17} className="text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar provas ou disciplinas..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="border-b border-slate-200">
            <nav className="flex gap-6 overflow-x-auto" aria-label="Status das provas">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm transition ${
                    activeTab === tab
                      ? "border-[#00355f] font-semibold text-[#00355f]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tabLabels[tab]}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {visibleExams.length ? (
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FileText className="mx-auto text-slate-400" size={28} />
              <h2 className="mt-3 text-base font-bold text-slate-800">
                Nenhuma prova encontrada
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ajuste a busca ou selecione outro status.
              </p>
            </section>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
