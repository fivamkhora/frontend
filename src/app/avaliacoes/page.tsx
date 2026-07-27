"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  MoreVertical,
  LoaderCircle,
  School,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  Trash2,
} from "lucide-react";
import { AppLayout } from "../_components/AppLayout";
import {
  fetchAuthenticatedUser,
  fetchTeacherClassrooms,
  type Classroom,
} from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type ExamResponse = {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  teacherId: string;
  externalAssessmentId?: string;
  aiVersion?: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "CORRECTED";
  availableAt: string | null;
  deadlineAt: string | null;
  timeLimit: number | null;
  createdAt: string;
  updatedAt: string;
  message?: string;
};

type Submission = {
  id: string;
  examId: string;
  studentId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "CORRECTED" | "CLOSED";
  score: number | null;
};

function formatDeadline(deadlineAt: string | null, status: string) {
  if (status === "DRAFT") return "Rascunho (Não publicado)";
  if (!deadlineAt) return "Sem prazo definido";

  const date = new Date(deadlineAt);
  return `Prazo: ${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  })}`;
}

function formatDateBr(isoDate: string | null) {
  if (!isoDate) return "Em breve";
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractSubject(title: string, description: string) {
  if (title.toLowerCase().includes("matemática")) return "Matemática";
  if (title.toLowerCase().includes("geografia")) return "Geografia";
  if (title.toLowerCase().includes("biologia")) return "Biologia";
  if (title.toLowerCase().includes("história")) return "História";

  const match = description.match(/Disciplina:\s*([^\n]+)/i);
  return match ? match[1].trim() : "Geral";
}

export default function MinhasProvasPage() {
  const router = useRouter();
  const { hasRole } = useAuth();

  // Verifica se o usuário logado é Professor ou Administrador
  const isTeacherOrAdmin = hasRole(["Professor", "Administrador"]);

  // Estados de Turmas
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Estados de Provas
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<ExamResponse[]>([]);
  const [submittedExamIds, setSubmittedExamIds] = useState<Set<string>>(
    new Set(),
  );
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState<string>("");

  // Paginação para Atividades Futuras
  const [upcomingPage, setUpcomingPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    let active = true;

    async function loadClassrooms() {
      try {
        setLoadingClasses(true);
        const data = await fetchTeacherClassrooms();

        if (active && data.length > 0) {
          setClassrooms(data);
          setSelectedClassroom(data[0].id);
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar suas turmas.");
          toast.error("Erro ao carregar lista de turmas.");
        }
      } finally {
        if (active) {
          setLoadingClasses(false);
        }
      }
    }

    loadClassrooms();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAvaliacoesESubmissoes() {
      try {
        setLoadingExams(true);
        setError("");
        setUpcomingPage(1);

        const authenticatedUser = await fetchAuthenticatedUser().catch(
          () => null,
        );

        const urlExams = selectedClassroom
          ? `/api/avaliacao/exams?classroomId=${encodeURIComponent(selectedClassroom)}`
          : `/api/avaliacao/exams`;

        const urlUpcoming = selectedClassroom
          ? `/api/avaliacao/exams/upcoming?classroomId=${encodeURIComponent(selectedClassroom)}`
          : `/api/avaliacao/exams/upcoming`;

        const [resExams, resSubmissions, resUpcoming] = await Promise.all([
          fetch(urlExams, { headers: { Accept: "application/json" } }),
          authenticatedUser?.id
            ? fetch(
                `/api/avaliacao/submissions?studentId=${authenticatedUser.id}`,
                {
                  headers: { Accept: "application/json" },
                },
              ).catch(() => null)
            : null,
          fetch(urlUpcoming, { headers: { Accept: "application/json" } }).catch(
            () => null,
          ),
        ]);

        if (!resExams.ok) {
          throw new Error("Não foi possível carregar as avaliações.");
        }

        const dataExams: ExamResponse[] = await resExams.json();
        const dataSubmissions: Submission[] = resSubmissions?.ok
          ? await resSubmissions.json().catch(() => [])
          : [];

        const dataUpcomingPayload = resUpcoming?.ok
          ? await resUpcoming.json().catch(() => null)
          : null;

        const dataUpcoming: ExamResponse[] = Array.isArray(
          dataUpcomingPayload?.exams,
        )
          ? dataUpcomingPayload.exams
          : Array.isArray(dataUpcomingPayload)
            ? dataUpcomingPayload
            : [];

        if (active) {
          setExams(Array.isArray(dataExams) ? dataExams : []);
          setUpcomingExams(dataUpcoming);

          const submittedIds = new Set(
            (Array.isArray(dataSubmissions) ? dataSubmissions : [])
              .filter(
                (sub) =>
                  sub.status === "SUBMITTED" ||
                  sub.status === "CORRECTED" ||
                  sub.status === "CLOSED",
              )
              .map((sub) => sub.examId),
          );

          setSubmittedExamIds(submittedIds);
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error
              ? err.message
              : "Erro ao buscar as avaliações.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoadingExams(false);
        }
      }
    }

    loadAvaliacoesESubmissoes();

    return () => {
      active = false;
    };
  }, [selectedClassroom]);

  // Filtro de provas ativas
  const availableExams = exams.filter((exam) => {
    if (isTeacherOrAdmin) {
      return exam.status === "PUBLISHED";
    }
    const isAlreadySubmitted = submittedExamIds.has(exam.id);
    return exam.status === "PUBLISHED" && !isAlreadySubmitted;
  });

  // Paginação
  const totalUpcomingPages = Math.ceil(upcomingExams.length / itemsPerPage);
  const startIndex = (upcomingPage - 1) * itemsPerPage;
  const paginatedUpcomingExams = upcomingExams.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // 🎯 Ação do Aluno: Iniciar Prova com Toast Promise
  async function handleStartExam(examId: string) {
    toast.promise(
      async () => {
        const authenticatedUser = await fetchAuthenticatedUser();

        const response = await fetch("/api/avaliacao/submissions", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            examId,
            studentId: String(authenticatedUser.id),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "Não foi possível iniciar a prova.",
          );
        }

        const submission = await response.json();
        router.push(`/provas/${examId}/realize?submissionId=${submission.id}`);
        return submission;
      },
      {
        loading: "Iniciando sua prova...",
        success: "Prova iniciada! Redirecionando...",
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Erro ao iniciar a prova. Tente novamente.",
      },
    );
  }

  // 🎯 Ação do Professor: Excluir/Cancelar Prova
  async function handleDeleteExam(examId: string) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) {
      return;
    }

    const toastId = toast.loading("Excluindo avaliação...");

    try {
      const res = await fetch(`/api/avaliacao/exams/${examId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Não foi possível excluir a avaliação.");
      }

      setExams((prev) => prev.filter((e) => e.id !== examId));
      setUpcomingExams((prev) => prev.filter((e) => e.id !== examId));

      toast.success("Avaliação excluída com sucesso!", { id: toastId });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao tentar excluir a avaliação.",
        { id: toastId },
      );
    }
  }

  return (
    <AppLayout active="avaliacoes">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Avaliações</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0f3b63]">
              {isTeacherOrAdmin
                ? "Gestão de Avaliações"
                : "Avaliações Disponíveis"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isTeacherOrAdmin
                ? "Gerencie provas ativas, acompanhe respostas e visualize agendamentos."
                : "Selecione e realize suas avaliações pendentes."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <School size={18} className="text-[#1e3a8a]" />
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              disabled={loadingClasses || classrooms.length === 0}
              aria-label="Selecionar Turma"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#1e3a8a] disabled:opacity-50"
            >
              {loadingClasses ? (
                <option value="">Carregando turmas...</option>
              ) : classrooms.length === 0 ? (
                <option value="">Todas as turmas</option>
              ) : (
                classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* GRID DE PROVAS ATIVAS */}
        {loadingExams ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500 mb-12">
            <LoaderCircle size={22} className="animate-spin text-[#1e3a8a]" />
            <span className="text-sm font-medium">
              Carregando avaliações...
            </span>
          </div>
        ) : availableExams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {availableExams.map((exam) => {
              const subject = extractSubject(exam.title, exam.description);
              const deadlineText = formatDeadline(exam.deadlineAt, exam.status);

              return (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {subject}
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Opções"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
                      {exam.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-6 whitespace-pre-line">
                      {exam.description}
                    </p>
                  </div>

                  <div>
                    <div className="space-y-1.5 mb-6 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} />
                        <span>{deadlineText}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={15} />
                        <span>
                          Duração:{" "}
                          {exam.timeLimit
                            ? `${exam.timeLimit} minutos`
                            : "Sem tempo limite"}
                        </span>
                      </div>
                    </div>

                    {isTeacherOrAdmin ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/provas/${exam.id}/membros`)
                          }
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={15} />
                          <span>Ver Respostas</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="Excluir Avaliação"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        className="block w-full rounded-lg bg-[#0052cc] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0043a8]"
                      >
                        Iniciar Prova
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center mb-12">
            <p className="text-sm font-medium text-slate-600">
              {isTeacherOrAdmin
                ? "Nenhuma avaliação cadastrada para esta turma."
                : "Você não possui nenhuma avaliação pendente nesta turma. 🎉"}
            </p>
          </div>
        )}

        {/* 🚀 SEÇÃO: PRÓXIMAS SEMANAS / LISTA PAGINADA */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-[#0052cc]" size={20} />
            <h2 className="text-xl font-bold text-slate-800">
              Próximas Semanas
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0052cc]">
              {upcomingExams.length}
            </span>
          </div>

          {totalUpcomingPages > 1 && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>
                Página {upcomingPage} de {totalUpcomingPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={upcomingPage === 1}
                  onClick={() => setUpcomingPage((p) => Math.max(p - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  disabled={upcomingPage === totalUpcomingPages}
                  onClick={() =>
                    setUpcomingPage((p) => Math.min(p + 1, totalUpcomingPages))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Próxima página"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {paginatedUpcomingExams.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
            {paginatedUpcomingExams.map((upcoming) => {
              const subject = extractSubject(
                upcoming.title,
                upcoming.description,
              );

              return (
                <div
                  key={upcoming.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0052cc]">
                      <BookOpen size={20} />
                    </div>

                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#0052cc]">
                          {subject}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Sparkles size={13} /> Em Breve
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800">
                        {upcoming.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {upcoming.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:shrink-0 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 px-3 py-1.5">
                      <Calendar size={14} className="text-[#0052cc]" />
                      <span>
                        Liberação:{" "}
                        <strong className="text-slate-700 font-semibold">
                          {formatDateBr(upcoming.availableAt)}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 px-3 py-1.5">
                      <Clock size={14} className="text-[#0052cc]" />
                      <span>
                        Duração:{" "}
                        <strong className="text-slate-700 font-semibold">
                          {upcoming.timeLimit
                            ? `${upcoming.timeLimit} min`
                            : "Sem limite"}
                        </strong>
                      </span>
                    </div>

                    {isTeacherOrAdmin && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleDeleteExam(upcoming.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={13} />
                          <span>Cancelar Agendamento</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center text-xs text-slate-400">
            Nenhuma atividade agendada para as próximas semanas nesta turma.
          </div>
        )}
      </section>
    </AppLayout>
  );
}
