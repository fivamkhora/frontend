"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Mail,
  MessageSquare,
  Printer,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

type SubjectPerformance = {
  attendance: number;
  average: number;
  firstTerm: number;
  id: number;
  secondTerm: number;
  status: "Aprovado" | "Atenção";
  subject: string;
  teacher: string;
};

const student = {
  attendance: 95,
  classroom: "1º Ano A",
  classroomPosition: 3,
  classroomStudents: 32,
  completedTasks: 28,
  email: "jose.aluno@example.com",
  generalAverage: 8.5,
  name: "José Aluno Exemplo",
  registration: "ALUN-1209",
  schoolYear: "2026",
  totalTasks: 30,
};

const subjects: SubjectPerformance[] = [
  {
    attendance: 96,
    average: 8.5,
    firstTerm: 8.2,
    id: 1,
    secondTerm: 8.8,
    status: "Aprovado",
    subject: "Matemática",
    teacher: "Maria Aparecida",
  },
  {
    attendance: 98,
    average: 8.8,
    firstTerm: 8.6,
    id: 2,
    secondTerm: 9,
    status: "Aprovado",
    subject: "Português",
    teacher: "João Santos",
  },
  {
    attendance: 92,
    average: 7.7,
    firstTerm: 7.4,
    id: 3,
    secondTerm: 8,
    status: "Aprovado",
    subject: "Geografia",
    teacher: "Ana Ferreira",
  },
  {
    attendance: 88,
    average: 6.7,
    firstTerm: 6.5,
    id: 4,
    secondTerm: 6.9,
    status: "Atenção",
    subject: "História",
    teacher: "Ricardo Lima",
  },
  {
    attendance: 97,
    average: 9.1,
    firstTerm: 8.9,
    id: 5,
    secondTerm: 9.2,
    status: "Aprovado",
    subject: "Ciências",
    teacher: "Helena Souza",
  },
];

const evolution = [
  { grade: 7.2, period: "Fev" },
  { grade: 7.8, period: "Mar" },
  { grade: 8.1, period: "Abr" },
  { grade: 7.9, period: "Mai" },
  { grade: 8.4, period: "Jun" },
  { grade: 8.5, period: "Jul" },
];

const skills = [
  { name: "Raciocínio lógico", value: 88 },
  { name: "Comunicação", value: 82 },
  { name: "Criatividade", value: 76 },
  { name: "Colaboração", value: 91 },
  { name: "Organização", value: 84 },
];

const observations = [
  {
    author: "Maria Aparecida",
    date: "18/07/2026",
    id: 1,
    role: "Professora de Matemática",
    text: "O aluno demonstrou ótima evolução na resolução de problemas e maior participação nas atividades em grupo.",
    type: "positive",
  },
  {
    author: "Ricardo Lima",
    date: "15/07/2026",
    id: 2,
    role: "Professor de História",
    text: "Recomenda-se reforçar a leitura dos conteúdos e a organização das respostas discursivas.",
    type: "attention",
  },
];

function KpiCard({
  footer,
  icon,
  progress,
  title,
  value,
}: {
  footer: ReactNode;
  icon: ReactNode;
  progress: number;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
        <div className="rounded-lg bg-blue-50 p-2 text-[#0f4c81]">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#00355f]">{value}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0f4c81]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="mt-3 text-xs text-slate-500">{footer}</div>
    </article>
  );
}

export default function StudentPerformancePage() {
  function printReport() {
    window.print();
  }

  return (
    <AppLayout active="alunos">
      <section className="px-4 py-6 sm:px-6 lg:px-8 print:p-0">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Classes</span>
                <span>&gt;</span>
                <span>Alunos</span>
                <span>&gt;</span>
                <span className="text-[#1e3a8a]">Desempenho</span>
              </div>
              <h1 className="text-3xl font-bold text-[#0f3b63]">
                Desempenho do aluno
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Registro acadêmico demonstrativo #{student.registration}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/classes"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Voltar
              </Link>
              <button
                type="button"
                onClick={printReport}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f4c81] px-3 text-sm font-semibold text-white hover:bg-[#00355f]"
              >
                <Printer size={16} />
                Imprimir relatório
              </button>
            </div>
          </header>

          <section className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-[#0f4c81]">
                JA
                <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  ATIVO
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#00355f]">
                  {student.name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={16} /> {student.classroom}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClipboardCheck size={16} /> {student.registration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={16} /> {student.email}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={`mailto:${student.email}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 print:hidden"
            >
              <MessageSquare size={17} />
              Contatar responsáveis
            </a>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Média geral"
              value={student.generalAverage.toFixed(1)}
              icon={<BarChart3 size={19} />}
              footer={
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <TrendingUp size={15} /> +0.3 no período
                </span>
              }
              progress={85}
            />
            <KpiCard
              title="Frequência"
              value={`${student.attendance}%`}
              icon={<CalendarCheck size={19} />}
              footer="Meta escolar: 90%"
              progress={student.attendance}
            />
            <KpiCard
              title="Tarefas concluídas"
              value={`${student.completedTasks}/${student.totalTasks}`}
              icon={<CheckCircle2 size={19} />}
              footer="2 atividades pendentes"
              progress={(student.completedTasks / student.totalTasks) * 100}
            />
            <KpiCard
              title="Posição na turma"
              value={`${student.classroomPosition}º`}
              icon={<Award size={19} />}
              footer={`Entre ${student.classroomStudents} alunos`}
              progress={91}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Competências</h2>
              <p className="text-sm text-slate-500">
                Indicadores acadêmicos e comportamentais.
              </p>
              <div className="mt-6 space-y-5">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {skill.name}
                      </span>
                      <strong className="text-[#0f4c81]">{skill.value}%</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Evolução das notas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Média mensal das avaliações realizadas.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Evolução positiva
                </span>
              </div>
              <div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-slate-200 px-4">
                {evolution.map((item) => (
                  <div
                    key={item.period}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-xs font-bold text-[#00355f]">
                      {item.grade.toFixed(1)}
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t bg-[#0f4c81]"
                      style={{ height: `${item.grade * 9}%` }}
                    />
                    <span className="mt-2 pb-2 text-xs text-slate-500">
                      {item.period}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Notas por disciplina
              </h2>
              <p className="text-sm text-slate-500">
                Resultado consolidado do ano letivo {student.schoolYear}.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Disciplina</th>
                    <th className="px-5 py-3">Professor</th>
                    <th className="px-5 py-3 text-center">1º período</th>
                    <th className="px-5 py-3 text-center">2º período</th>
                    <th className="px-5 py-3 text-center">Média</th>
                    <th className="px-5 py-3 text-center">Frequência</th>
                    <th className="px-5 py-3 text-center">Situação</th>
                    <th className="px-5 py-3 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {subject.subject}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {subject.teacher}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {subject.firstTerm.toFixed(1)}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {subject.secondTerm.toFixed(1)}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-900">
                        {subject.average.toFixed(1)}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {subject.attendance}%
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            subject.status === "Aprovado"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {subject.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            window.alert(
                              `Detalhamento de ${subject.subject} disponível apenas na demonstração.`,
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81]"
                        >
                          Visualizar <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Observações pedagógicas
            </h2>
            <p className="text-sm text-slate-500">
              Registros adicionados pelos professores.
            </p>
            <div className="mt-5 space-y-4">
              {observations.map((observation) => (
                <article
                  key={observation.id}
                  className={`border-l-4 p-4 ${
                    observation.type === "positive"
                      ? "border-l-emerald-600 bg-emerald-50/60"
                      : "border-l-amber-500 bg-amber-50/60"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-bold text-slate-900">
                        {observation.author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {observation.role}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {observation.date}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {observation.text}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppLayout>
  );
}
