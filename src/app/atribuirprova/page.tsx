"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Layers,
  LoaderCircle,
  PlusCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import {
  normalizeText,
  toAssessmentItem,
  type AssessmentItem,
  type AssessmentsResponse,
} from "@/app/provas/page";
import {
  fetchAuthenticatedUser,
  fetchTeacherClassrooms,
  redirectToLoginOnUnauthorized,
  type AuthenticatedUser,
  type Classroom,
} from "@/services/authService";

type AssignmentsByClassroom = Record<string, string[]>;

type AssessmentsError = {
  error?: string;
  message?: string;
};

function getAssessmentCode(id: string) {
  return `PROVA-${id.slice(0, 8).toUpperCase()}`;
}

function getClassroomColor(index: number) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
  ];

  return colors[index % colors.length] ?? colors[0];
}

async function fetchAssessments() {
  const response = await fetch("/api/ia/assessments", {
    headers: { Accept: "application/json" },
  });
  redirectToLoginOnUnauthorized(response);

  const data = (await response.json()) as AssessmentsResponse | AssessmentsError;

  if (!response.ok) {
    const error = data as AssessmentsError;

    throw new Error(
      error.message || error.error || "Não foi possível carregar as provas.",
    );
  }

  const payload = data as AssessmentsResponse;

  if (!Array.isArray(payload.data)) {
    throw new Error("Resposta inválida ao carregar as provas.");
  }

  return payload.data.map(toAssessmentItem);
}

export default function AtribuirProvaPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<AssignmentsByClassroom>({});
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(
    null,
  );
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        const [authenticatedUser, assessmentItems, classroomItems] =
          await Promise.all([
            fetchAuthenticatedUser(),
            fetchAssessments(),
            fetchTeacherClassrooms(),
          ]);

        if (!active) {
          return;
        }

        setUser(authenticatedUser);
        setAssessments(assessmentItems);
        setClassrooms(classroomItems);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os dados para atribuição.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      active = false;
    };
  }, []);

  const selectedAssessment = assessments.find(
    (assessment) => assessment.id === selectedAssessmentId,
  );

  const filteredAssessments = useMemo(() => {
    const search = normalizeText(assessmentSearch.trim());

    if (!search) {
      return assessments;
    }

    return assessments.filter((assessment) =>
      normalizeText(
        [assessment.title, assessment.subject, assessment.gradeLevel].join(" "),
      ).includes(search),
    );
  }, [assessmentSearch, assessments]);

  const filteredClassrooms = useMemo(() => {
    const search = normalizeText(classroomSearch.trim());

    if (!search) {
      return classrooms;
    }

    return classrooms.filter((classroom) =>
      normalizeText(
        [classroom.name, classroom.code, classroom.schoolYear].join(" "),
      ).includes(search),
    );
  }, [classroomSearch, classrooms]);

  function linkAssessment(classroomId: string) {
    if (!selectedAssessment) {
      setStatusMessage("Selecione uma prova antes de realizar a atribuição.");
      return;
    }

    const linkedAssessments = assignments[classroomId] ?? [];

    if (linkedAssessments.includes(selectedAssessment.id)) {
      setStatusMessage("A prova selecionada já está vinculada a esta turma.");
      return;
    }

    setAssignments((current) => ({
      ...current,
      [classroomId]: [...(current[classroomId] ?? []), selectedAssessment.id],
    }));
    setStatusMessage(
      `${selectedAssessment.title} foi vinculada à turma selecionada nesta sessão.`,
    );
  }

  function unlinkAssessment(classroomId: string, assessmentId: string) {
    setAssignments((current) => ({
      ...current,
      [classroomId]: (current[classroomId] ?? []).filter(
        (linkedId) => linkedId !== assessmentId,
      ),
    }));
    setStatusMessage("Vínculo removido nesta sessão.");
  }

  function getAssessmentTitle(assessmentId: string) {
    return (
      assessments.find((assessment) => assessment.id === assessmentId)?.title ||
      "Prova não encontrada"
    );
  }

  return (
    <AppLayout active="atribuirprova" user={user}>
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Atribuir Provas</span>
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[#0f3b63]">
            Atribuição de Provas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vincule avaliações disponíveis às suas turmas.
          </p>
        </header>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
            <LoaderCircle className="mx-auto mb-3 animate-spin text-[#1e3a8a]" />
            Carregando provas e turmas...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <FileText size={18} className="text-[#003b5c]" />
                  <h2 className="font-bold text-slate-800">
                    Avaliações Disponíveis
                  </h2>
                </div>

                <div className="border-b border-slate-100 p-4">
                  <label className="relative block">
                    <span className="sr-only">Buscar prova</span>
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="search"
                      value={assessmentSearch}
                      onChange={(event) => setAssessmentSearch(event.target.value)}
                      placeholder="Buscar prova..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                    />
                  </label>
                </div>

                <div className="max-h-[680px] space-y-3 overflow-y-auto p-4">
                  {filteredAssessments.map((assessment) => {
                    const selected = selectedAssessmentId === assessment.id;

                    return (
                      <button
                        key={assessment.id}
                        type="button"
                        onClick={() => {
                          setSelectedAssessmentId(assessment.id);
                          setStatusMessage("");
                        }}
                        className={`w-full rounded-lg border p-4 text-left transition ${
                          selected
                            ? "border-[#003b5c] bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900">
                              {assessment.title}
                            </h3>
                            <p className="mt-1 truncate text-xs font-medium text-slate-400">
                              {getAssessmentCode(assessment.id)}
                            </p>
                          </div>
                          {selected && (
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-[#003b5c]"
                            />
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            {assessment.createdAt}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-[#003b5c]">
                            {assessment.subject}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredAssessments.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      Nenhuma avaliação encontrada.
                    </div>
                  )}
                </div>
              </section>

              <div className="hidden items-center justify-center xl:flex">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ArrowRight size={30} />
                  <span className="text-xs font-semibold">Vincular</span>
                </div>
              </div>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <Users size={18} className="text-[#003b5c]" />
                  <h2 className="font-bold text-slate-800">Turmas</h2>
                </div>

                <div className="border-b border-slate-100 p-4">
                  <label className="relative block">
                    <span className="sr-only">Buscar turma</span>
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="search"
                      value={classroomSearch}
                      onChange={(event) => setClassroomSearch(event.target.value)}
                      placeholder="Buscar turma..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                    />
                  </label>
                </div>

                <div className="max-h-[680px] space-y-4 overflow-y-auto p-4">
                  {filteredClassrooms.map((classroom, index) => {
                    const linkedAssessmentIds = assignments[classroom.id] ?? [];

                    return (
                      <article
                        key={classroom.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold ${getClassroomColor(index)}`}
                          >
                            {classroom.name.slice(0, 3).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900">
                              {classroom.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {classroom.code} | Ano letivo {classroom.schoolYear}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                            Provas vinculadas
                          </p>

                          {linkedAssessmentIds.length > 0 ? (
                            <div className="space-y-2">
                              {linkedAssessmentIds.map((assessmentId) => (
                                <div
                                  key={assessmentId}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white px-3 py-2"
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Layers
                                      size={14}
                                      className="shrink-0 text-[#003b5c]"
                                    />
                                    <span className="truncate text-xs font-semibold text-[#003b5c]">
                                      {getAssessmentTitle(assessmentId)}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    title="Remover prova"
                                    onClick={() =>
                                      unlinkAssessment(classroom.id, assessmentId)
                                    }
                                    className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                  >
                                    <X size={14} />
                                    <span className="sr-only">Remover prova</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-xs text-slate-500">
                              Nenhuma prova vinculada.
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => linkAssessment(classroom.id)}
                            disabled={!selectedAssessment}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#062f46] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <PlusCircle size={15} />
                            Vincular prova selecionada
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {filteredClassrooms.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      Nenhuma turma encontrada.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div
              aria-live="polite"
              className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-[#003b5c]"
            >
              {statusMessage ||
                (selectedAssessment
                  ? `Prova selecionada: ${selectedAssessment.title}.`
                  : "Selecione uma avaliação para iniciar a atribuição.")}
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
}
