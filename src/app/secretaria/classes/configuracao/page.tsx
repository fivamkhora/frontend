"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, PlusCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { redirectToLoginOnUnauthorized } from "@/services/authService";
import {
  addClassroomStudent,
  addClassroomTeacher,
  fetchClassroomConfiguration,
  fetchProfessors,
  fetchStudents,
  removeClassroomStudent,
  removeClassroomTeacher,
  type DirectoryUser,
  type ClassroomConfiguration,
} from "@/services/secretariaService";
import {
  AssignmentSection,
  type AssignmentUser,
} from "./_components/AssignmentSection";

type ApiErrorResponse = {
  data?: unknown;
  error?: string;
  id?: unknown;
  upstreamResponse?: {
    error?: string;
    message?: string;
  };
};

function getErrorMessage(data: ApiErrorResponse) {
  return (
    data.upstreamResponse?.message ||
    data.upstreamResponse?.error ||
    data.error ||
    "Nao foi possivel criar a turma."
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function toAssignmentUser(user: DirectoryUser): AssignmentUser {
  return {
    ...user,
    initials: getInitials(user.name) || "US",
  };
}

function getCreatedClassroomId(data: ApiErrorResponse) {
  if (typeof data.id === "string" && data.id.trim()) {
    return data.id;
  }

  if (data.data && typeof data.data === "object") {
    const wrappedData = data.data as { id?: unknown };

    if (typeof wrappedData.id === "string" && wrappedData.id.trim()) {
      return wrappedData.id;
    }
  }

  return null;
}

function getMemberIds(
  members: ClassroomConfiguration["members"],
  role: "aluno" | "professor",
) {
  return members
    .filter((member) => member.role.trim().toLowerCase() === role)
    .map((member) => member.userId);
}

function SecretariaClassesConfiguracaoContent() {
  const searchParams = useSearchParams();
  const requestedClassroomId = searchParams.get("id")?.trim() || null;
  const [name, setName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026");
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [loadingConfiguration, setLoadingConfiguration] = useState(
    requestedClassroomId !== null,
  );
  const [linkedTeacherIds, setLinkedTeacherIds] = useState<number[]>([]);
  const [linkedStudentIds, setLinkedStudentIds] = useState<number[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<AssignmentUser[]>(
    [],
  );
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teachersError, setTeachersError] = useState("");
  const [teacherActionId, setTeacherActionId] = useState<number | null>(null);
  const [teacherAssignmentError, setTeacherAssignmentError] = useState("");
  const [availableStudents, setAvailableStudents] = useState<AssignmentUser[]>(
    [],
  );
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [studentActionId, setStudentActionId] = useState<number | null>(null);
  const [studentAssignmentError, setStudentAssignmentError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTeachers = useMemo(
    () =>
      availableTeachers.filter((teacher) =>
        linkedTeacherIds.includes(teacher.id),
      ),
    [availableTeachers, linkedTeacherIds],
  );
  const selectedStudents = useMemo(
    () =>
      availableStudents.filter((student) =>
        linkedStudentIds.includes(student.id),
      ),
    [availableStudents, linkedStudentIds],
  );

  function applyMembers(members: ClassroomConfiguration["members"]) {
    setLinkedTeacherIds(getMemberIds(members, "professor"));
    setLinkedStudentIds(getMemberIds(members, "aluno"));
  }

  async function refreshMembers(currentClassroomId: string) {
    const configuration = await fetchClassroomConfiguration(
      currentClassroomId,
    );

    applyMembers(configuration.members);
  }

  useEffect(() => {
    let active = true;

    async function loadProfessors() {
      try {
        const professors = await fetchProfessors();

        if (active) {
          setAvailableTeachers(professors.map(toAssignmentUser));
        }
      } catch (loadError) {
        if (active) {
          setTeachersError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar os professores.",
          );
        }
      } finally {
        if (active) {
          setLoadingTeachers(false);
        }
      }
    }

    async function loadStudents() {
      try {
        const students = await fetchStudents();

        if (active) {
          setAvailableStudents(students.map(toAssignmentUser));
        }
      } catch (loadError) {
        if (active) {
          setStudentsError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar os alunos.",
          );
        }
      } finally {
        if (active) {
          setLoadingStudents(false);
        }
      }
    }

    loadProfessors();
    loadStudents();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!requestedClassroomId) {
      return;
    }

    let active = true;
    setLoadingConfiguration(true);
    setError("");

    async function loadConfiguration() {
      try {
        const configuration = await fetchClassroomConfiguration(
          requestedClassroomId as string,
        );

        if (!active) {
          return;
        }

        setName(configuration.classroom.name);
        setSchoolYear(configuration.classroom.schoolYear || "2026");
        setClassroomId(configuration.classroom.id);
        setLinkedTeacherIds(
          getMemberIds(configuration.members, "professor"),
        );
        setLinkedStudentIds(getMemberIds(configuration.members, "aluno"));
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar a configuracao da turma.",
          );
        }
      } finally {
        if (active) {
          setLoadingConfiguration(false);
        }
      }
    }

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [requestedClassroomId]);

  async function handleAddTeacher(teacher: AssignmentUser) {
    if (!classroomId) {
      setTeacherAssignmentError(
        "Crie a turma antes de adicionar professores.",
      );
      return;
    }

    setTeacherAssignmentError("");
    setTeacherActionId(teacher.id);

    try {
      await addClassroomTeacher(classroomId, teacher.id);
      await refreshMembers(classroomId);
    } catch (actionError) {
      setTeacherAssignmentError(
        actionError instanceof Error
          ? actionError.message
          : "Nao foi possivel adicionar o professor.",
      );
    } finally {
      setTeacherActionId(null);
    }
  }

  async function handleRemoveTeacher(teacherId: number) {
    if (!classroomId) {
      return;
    }

    setTeacherAssignmentError("");
    setTeacherActionId(teacherId);

    try {
      await removeClassroomTeacher(classroomId, teacherId);
      await refreshMembers(classroomId);
    } catch (actionError) {
      setTeacherAssignmentError(
        actionError instanceof Error
          ? actionError.message
          : "Nao foi possivel remover o professor.",
      );
    } finally {
      setTeacherActionId(null);
    }
  }

  async function handleAddStudent(student: AssignmentUser) {
    if (!classroomId) {
      setStudentAssignmentError("Crie a turma antes de adicionar alunos.");
      return;
    }

    setStudentAssignmentError("");
    setStudentActionId(student.id);

    try {
      await addClassroomStudent(classroomId, student.id);
      await refreshMembers(classroomId);
    } catch (actionError) {
      setStudentAssignmentError(
        actionError instanceof Error
          ? actionError.message
          : "Nao foi possivel adicionar o aluno.",
      );
    } finally {
      setStudentActionId(null);
    }
  }

  async function handleRemoveStudent(studentId: number) {
    if (!classroomId) {
      return;
    }

    setStudentAssignmentError("");
    setStudentActionId(studentId);

    try {
      await removeClassroomStudent(classroomId, studentId);
      await refreshMembers(classroomId);
    } catch (actionError) {
      setStudentAssignmentError(
        actionError instanceof Error
          ? actionError.message
          : "Nao foi possivel remover o aluno.",
      );
    } finally {
      setStudentActionId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (classroomId || requestedClassroomId) {
      return;
    }

    if (!name.trim()) {
      setError("Informe o nome da turma.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/turma/classrooms", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolYear,
        }),
      });
      redirectToLoginOnUnauthorized(response);
      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      const createdClassroomId = getCreatedClassroomId(data);

      if (!createdClassroomId) {
        throw new Error("A turma foi criada, mas o BFF nao retornou o ID.");
      }

      setClassroomId(createdClassroomId);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel criar a turma.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout active="secretaria">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <div className="mb-1 text-xs font-medium text-slate-400">
            Secretaria &gt; Classes &gt; Configuracao
          </div>
          <h1 className="text-3xl font-bold text-[#003b5c]">
            {requestedClassroomId ? "Configurar Turma" : "Nova Turma"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha as informacoes e vincule professores e alunos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-6 sm:p-8">
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info size={18} className="text-[#003b5c]" />
                <h2 className="text-lg font-bold text-slate-800">
                  Informacoes Basicas
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="class-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nome da Turma
                  </label>
                  <input
                    id="class-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex: Turma 1A"
                    maxLength={100}
                    required
                    disabled={
                      loading ||
                      loadingConfiguration ||
                      classroomId !== null ||
                      requestedClassroomId !== null
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Identificacao usada por professores e alunos.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="school-year"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Ano Letivo
                  </label>
                  <select
                    id="school-year"
                    value={schoolYear}
                    onChange={(event) => setSchoolYear(event.target.value)}
                    disabled={
                      loading ||
                      loadingConfiguration ||
                      classroomId !== null ||
                      requestedClassroomId !== null
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="mb-8 flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {loadingConfiguration ? (
                  <p className="text-sm text-slate-600">
                    Carregando dados e vinculos da turma...
                  </p>
                ) : classroomId ? (
                  <div className="flex items-start gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                    <span>
                      {requestedClassroomId
                        ? "Turma carregada. Atualize os vinculos de professores e alunos."
                        : "Turma criada com sucesso. Agora adicione professores e alunos."}
                    </span>
                  </div>
                ) : requestedClassroomId ? (
                  <p className="text-sm text-slate-600">
                    A configuracao da turma nao esta disponivel.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    Crie a turma para liberar as atribuicoes de usuarios.
                  </p>
                )}

                {error && (
                  <p role="alert" className="mt-2 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  href="/secretaria/classes"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#003b5c] bg-white px-5 py-2.5 text-sm font-semibold text-[#003b5c] transition hover:bg-blue-50"
                >
                  <XCircle size={16} />
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingConfiguration ||
                    classroomId !== null ||
                    requestedClassroomId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#062f46] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {classroomId ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  {loading || loadingConfiguration
                    ? requestedClassroomId
                      ? "Carregando..."
                      : "Criando..."
                    : classroomId
                      ? requestedClassroomId
                        ? "Turma carregada"
                        : "Turma criada"
                      : requestedClassroomId
                        ? "Turma indisponivel"
                        : "Criar Turma"}
                </button>
              </div>
            </div>

            <AssignmentSection
              actionUserId={teacherActionId}
              assignmentError={teacherAssignmentError}
              availableUsers={availableTeachers}
              classroomReady={classroomId !== null}
              description="Selecione um ou mais professores para esta turma:"
              emptyMessage="Nenhum professor cadastrado foi encontrado."
              loadError={teachersError}
              loading={loadingTeachers}
              loadingMessage="Carregando professores..."
              onAdd={handleAddTeacher}
              onRemove={handleRemoveTeacher}
              selectedLabel="Professores vinculados"
              selectedUsers={selectedTeachers}
              title="Atribuicao de professores"
            />

            <div className="my-8 border-t border-slate-200" />

            <AssignmentSection
              actionUserId={studentActionId}
              assignmentError={studentAssignmentError}
              availableUsers={availableStudents}
              classroomReady={classroomId !== null}
              description="Selecione um ou mais alunos para esta turma:"
              emptyMessage="Nenhum aluno cadastrado foi encontrado."
              loadError={studentsError}
              loading={loadingStudents}
              loadingMessage="Carregando alunos..."
              onAdd={handleAddStudent}
              onRemove={handleRemoveStudent}
              selectedLabel="Alunos vinculados"
              selectedUsers={selectedStudents}
              title="Atribuicao de alunos"
            />
          </div>
        </form>
      </section>
    </AppLayout>
  );
}

function ConfigurationLoading() {
  return (
    <AppLayout active="secretaria">
      <div className="p-8 text-sm font-medium text-slate-500">
        Carregando configuracao da turma...
      </div>
    </AppLayout>
  );
}

export default function SecretariaClassesConfiguracaoPage() {
  return (
    <Suspense fallback={<ConfigurationLoading />}>
      <SecretariaClassesConfiguracaoContent />
    </Suspense>
  );
}
