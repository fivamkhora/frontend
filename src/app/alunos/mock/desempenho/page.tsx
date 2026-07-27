"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Hash,
  Printer,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

type SubjectStatus = "Aprovado" | "Recuperação";

type SubjectGrade = {
  average: number;
  firstGrade: number;
  secondGrade: number;
  status: SubjectStatus;
  subject: string;
};

const student = {
  attendance: 95,
  classroom: "1A",
  classroomPosition: 3,
  classroomStudents: 32,
  completedTasks: 28,
  generalAverage: 8.5,
  name: "Ana Beatriz Rocha",
  registration: "ALUN-1209",
  totalTasks: 30,
};

const gradeEvolution = [
  { classroom: 7, label: "1º Bim", student: 9 },
  { classroom: 7.8, label: "2º Bim", student: 10 },
  { classroom: 7.4, label: "3º Bim", student: 9.5 },
];

const subjects: SubjectGrade[] = [
  {
    average: 8.5,
    firstGrade: 8,
    secondGrade: 9,
    status: "Aprovado",
    subject: "Português",
  },
  {
    average: 9,
    firstGrade: 9.5,
    secondGrade: 8.5,
    status: "Aprovado",
    subject: "Matemática",
  },
  {
    average: 7.5,
    firstGrade: 7.5,
    secondGrade: 7.5,
    status: "Aprovado",
    subject: "História",
  },
  {
    average: 8,
    firstGrade: 8,
    secondGrade: 8,
    status: "Aprovado",
    subject: "Geografia",
  },
  {
    average: 6.5,
    firstGrade: 6,
    secondGrade: 7,
    status: "Recuperação",
    subject: "Ciências",
  },
];

const observations = [
  {
    author: "Prof. Marcos (Matemática)",
    date: "12 Out, 2023",
    id: 1,
    text: "Ana demonstra excelente raciocínio lógico e auxilia os colegas durante as atividades em grupo. Teve um ótimo desempenho no teste de álgebra.",
  },
  {
    author: "Orientação Educacional",
    date: "05 Out, 2023",
    id: 2,
    text: "Participou da reunião de liderança estudantil com propostas relevantes para a melhoria do refeitório escolar.",
  },
  {
    author: "Prof. Helena (Ciências)",
    date: "28 Set, 2023",
    id: 3,
    text: "Houve uma leve queda na nota da N1 devido à falta de entrega de um relatório de laboratório. Recomendado foco na organização de prazos.",
  },
  {
    author: "Prof. Cláudia (Português)",
    date: "18 Set, 2023",
    id: 4,
    text: "Apresentou boa evolução na produção textual e maior atenção à estrutura dos argumentos.",
  },
];

function MetricCard({
  detail,
  footer,
  progress,
  progressColor = "bg-[#0f4c81]",
  title,
  value,
}: {
  detail?: ReactNode;
  footer?: ReactNode;
  progress?: number;
  progressColor?: string;
  title: string;
  value: string;
}) {
  return (
    <article className="min-h-36 rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      <div className="mt-2 flex min-h-10 items-baseline gap-2">
        <strong className="text-3xl font-bold text-[#00355f]">{value}</strong>
        {detail}
      </div>
      {typeof progress === "number" ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${progressColor}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {footer ? <div className="mt-4 text-xs text-slate-500">{footer}</div> : null}
    </article>
  );
}

function CompetencyRadar() {
  return (
    <div className="mx-auto w-full max-w-80" role="img" aria-label="Radar de competências da aluna">
      <svg viewBox="0 0 280 250" className="h-auto w-full">
        <title>Competências da aluna</title>
        <g fill="none" stroke="#dbe3ec" strokeWidth="1">
          <circle cx="140" cy="120" r="82" />
          <circle cx="140" cy="120" r="55" />
          <circle cx="140" cy="120" r="28" />
          <line x1="140" y1="38" x2="140" y2="202" />
          <line x1="58" y1="120" x2="222" y2="120" />
          <line x1="74" y1="70" x2="206" y2="170" />
          <line x1="206" y1="70" x2="74" y2="170" />
        </g>
        <path
          d="M140 55 L197 101 L178 166 L101 168 L83 96 Z"
          fill="rgba(15, 76, 129, 0.16)"
          stroke="#0f4c81"
          strokeWidth="2"
        />
        {[
          [140, 55],
          [197, 101],
          [178, 166],
          [101, 168],
          [83, 96],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#00355f" />
        ))}
        <g fill="#42474f" fontSize="11" fontWeight="600" textAnchor="middle">
          <text x="140" y="18">Liderança</text>
          <text x="238" y="91">Comunicação</text>
          <text x="211" y="219">Raciocínio</text>
          <text x="69" y="219">Colaboração</text>
          <text x="42" y="91">Criatividade</text>
        </g>
      </svg>
    </div>
  );
}

function GradeEvolutionChart() {
  return (
    <div>
      <div className="mb-5 flex flex-wrap justify-end gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0f4c81]" /> Aluna
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-300" /> Turma
        </span>
      </div>
      <div className="relative h-64 border-b border-l border-slate-200 pl-8">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7 pl-8 text-[11px] text-slate-400">
          {[10, 8, 6, 4, 2, 0].map((grade) => (
            <div key={grade} className="relative border-t border-dashed border-slate-100">
              <span className="absolute -left-8 -top-2">{grade}</span>
            </div>
          ))}
        </div>
        <div className="relative z-10 flex h-full items-end justify-around gap-3 px-2 sm:px-6">
          {gradeEvolution.map((period) => (
            <div key={period.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              <div className="flex h-48 items-end justify-center gap-1.5 sm:gap-2">
                <div
                  className="w-5 rounded-t bg-[#0f4c81] sm:w-8"
                  style={{ height: `${period.student * 10}%` }}
                  title={`Aluna: ${period.student.toFixed(1)}`}
                />
                <div
                  className="w-5 rounded-t bg-slate-300 sm:w-8"
                  style={{ height: `${period.classroom * 10}%` }}
                  title={`Turma: ${period.classroom.toFixed(1)}`}
                />
              </div>
              <span className="mt-2 pb-2 text-center text-xs font-semibold text-slate-600">
                {period.label}
              </span>
            </div>
          ))}
          <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            <div className="flex h-48 items-end">
              <div className="h-[88%] w-8 rounded-t border-2 border-dashed border-[#0f4c81] bg-blue-100/60 sm:w-12" />
            </div>
            <span className="mt-2 pb-2 text-center text-xs font-semibold text-slate-400">
              Projeção 4º
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentPerformancePage() {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const visibleObservations = showFullHistory ? observations : observations.slice(0, 3);

  return (
    <AppLayout active="alunos">
      <section className="px-4 py-6 sm:px-6 lg:px-8 print:p-0">
        <div className="mx-auto max-w-7xl space-y-4">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end print:hidden">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Classes</span>
                <span>/</span>
                <span>Alunos</span>
                <span>/</span>
                <span className="text-[#0f4c81]">Desempenho</span>
              </div>
              <h1 className="text-3xl font-bold text-[#0f3b63]">Desempenho do aluno</h1>
              <p className="mt-1 text-sm text-slate-500">
                Visão consolidada do desempenho acadêmico e pedagógico.
              </p>
            </div>
            <Link
              href="/classes"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>
          </header>

          <section className="flex flex-col justify-between gap-6 rounded-lg border border-slate-200 bg-white p-6 md:flex-row md:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-[#0f4c81] ring-4 ring-blue-50">
                AB
                <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-[#13543b] px-2 py-0.5 text-[10px] font-bold text-white">
                  ATV
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#00355f]">{student.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={17} /> Turma: {student.classroom}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash size={17} /> Matrícula: #{student.registration}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Printer size={17} />
                Gerar boletim
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Média geral"
              value={student.generalAverage.toFixed(1)}
              detail={
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <TrendingUp size={15} /> +0.3
                </span>
              }
              progress={85}
            />
            <MetricCard
              title="Frequência"
              value={`${student.attendance}%`}
              detail={<span className="text-xs text-slate-500">Meta: 90%</span>}
              progress={student.attendance}
              progressColor="bg-[#13543b]"
            />
            <MetricCard
              title="Tarefas concluídas"
              value={`${student.completedTasks}/${student.totalTasks}`}
              footer="2 pendentes este mês"
            />
            <MetricCard
              title="Posição na turma"
              value={`${student.classroomPosition}º`}
              detail={<span className="text-xs text-slate-500">de {student.classroomStudents} alunos</span>}
              footer={
                <span className="flex gap-1" aria-label="Terceira posição da turma">
                  {[0, 1, 2, 3, 4].map((position) => (
                    <span
                      key={position}
                      className={`h-2 w-2 rounded-full ${position < 3 ? "bg-[#0f4c81]" : "bg-slate-200"}`}
                    />
                  ))}
                </span>
              }
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-4">
              <h2 className="text-lg font-semibold text-slate-900">Competências</h2>
              <p className="mt-1 text-sm text-slate-500">Indicadores acadêmicos e socioemocionais.</p>
              <div className="mt-6">
                <CompetencyRadar />
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-8">
              <h2 className="text-lg font-semibold text-slate-900">Evolução de notas</h2>
              <p className="mt-1 text-sm text-slate-500">Comparativo com a média da turma.</p>
              <div className="mt-4">
                <GradeEvolutionChart />
              </div>
            </article>

            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white lg:col-span-8">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                <h2 className="text-lg font-semibold text-slate-900">Notas por disciplina</h2>
                <span className="text-xs text-slate-500">Atualizado em 15/10/2023</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-slate-50/60 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Disciplina</th>
                      <th className="px-6 py-4 text-center">N1</th>
                      <th className="px-6 py-4 text-center">N2</th>
                      <th className="px-6 py-4 text-center">Média</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.subject} className="border-t border-slate-100 even:bg-slate-50/40">
                        <td className="px-6 py-4 font-semibold text-slate-900">{subject.subject}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{subject.firstGrade.toFixed(1)}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{subject.secondGrade.toFixed(1)}</td>
                        <td
                          className={`px-6 py-4 text-center font-bold ${
                            subject.status === "Aprovado" ? "text-[#0f4c81]" : "text-red-700"
                          }`}
                        >
                          {subject.average.toFixed(1)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              subject.status === "Aprovado"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {subject.status === "Aprovado" ? <CheckCircle2 className="mr-1 inline" size={13} /> : null}
                            {subject.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-4">
              <h2 className="text-lg font-semibold text-slate-900">Observações pedagógicas</h2>
              <div className="mt-6 space-y-6">
                {visibleObservations.map((observation, index) => (
                  <div
                    key={observation.id}
                    className={`border-l-2 pl-4 ${index % 2 === 0 ? "border-[#0f4c81]" : "border-slate-300"}`}
                  >
                    <p className="text-xs font-bold text-slate-500">
                      {observation.date} · {observation.author}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{observation.text}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowFullHistory((current) => !current)}
                className="mt-8 h-10 w-full rounded border border-[#0f4c81] px-4 text-sm font-semibold text-[#0f4c81] hover:bg-[#0f4c81] hover:text-white print:hidden"
              >
                {showFullHistory ? "Ocultar histórico" : "Ver histórico completo"}
              </button>
            </article>
          </section>
        </div>
      </section>
    </AppLayout>
  );
}
