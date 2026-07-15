"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Info,
  PlusCircle,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import {
  fetchProfessors,
  type Professor,
} from "@/services/secretariaService";

type Teacher = Professor & {
  initials: string;
};

type ApiErrorResponse = {
  error?: string;
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

function toTeacher(professor: Professor): Teacher {
  return {
    ...professor,
    initials: getInitials(professor.name) || "PR",
  };
}

export default function SecretariaClassesConfiguracaoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026");
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teachersError, setTeachersError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTeacherIds = useMemo(
    () => selectedTeachers.map((teacher) => teacher.id),
    [selectedTeachers],
  );

  useEffect(() => {
    let active = true;

    async function loadProfessors() {
      try {
        const professors = await fetchProfessors();

        if (active) {
          setAvailableTeachers(professors.map(toTeacher));
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

    loadProfessors();

    return () => {
      active = false;
    };
  }, []);

  function handleAddTeacher(teacher: Teacher) {
    setSelectedTeachers((current) =>
      current.some((item) => item.id === teacher.id)
        ? current
        : [...current, teacher],
    );
  }

  function handleRemoveTeacher(teacherId: number) {
    setSelectedTeachers((current) =>
      current.filter((teacher) => teacher.id !== teacherId),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Informe o nome da turma.");
      return;
    }

    if (selectedTeacherIds.length === 0) {
      setError("Selecione ao menos um professor responsavel.");
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
          teacherIds: selectedTeacherIds,
        }),
      });
      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      router.push("/secretaria/classes");
      router.refresh();
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
          <h1 className="text-3xl font-bold text-[#003b5c]">Nova Turma</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha as informacoes e atribua os professores responsaveis.
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
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#003b5c]" />
                  <h2 className="text-lg font-bold text-slate-800">
                    Atribuicao
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003b5c]">
                  Selecionados: {selectedTeachers.length}
                </span>
              </div>

              <p className="mb-4 text-sm font-semibold text-slate-700">
                Selecione um ou mais professores para esta turma:
              </p>

              {loadingTeachers && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
                  Carregando professores...
                </div>
              )}

              {!loadingTeachers && teachersError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  {teachersError}
                </div>
              )}

              {!loadingTeachers &&
                !teachersError &&
                availableTeachers.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Nenhum professor cadastrado foi encontrado.
                  </div>
                )}

              {!loadingTeachers && availableTeachers.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableTeachers.map((teacher) => {
                    const selected = selectedTeacherIds.includes(teacher.id);

                    return (
                      <article
                        key={teacher.id}
                        className={`flex min-h-20 items-center justify-between gap-3 rounded-lg border p-4 transition ${
                          selected
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              selected
                                ? "bg-blue-200 text-[#003b5c]"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {teacher.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {teacher.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {teacher.email || teacher.username}
                            </p>
                          </div>
                        </div>

                        {selected ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeacher(teacher.id)}
                            className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Remover
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddTeacher(teacher)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#003b5c] bg-white px-3 py-1.5 text-xs font-semibold text-[#003b5c] transition hover:bg-blue-50"
                          >
                            <UserPlus size={13} />
                            Adicionar
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {selectedTeachers.length > 0 && (
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#003b5c]">
                    <CheckCircle2 size={17} />
                    Professores selecionados
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeachers.map((teacher) => (
                      <span
                        key={teacher.id}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        {teacher.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
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
                loading || loadingTeachers || availableTeachers.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#062f46] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle size={16} />
              {loading ? "Criando..." : "Criar Turma"}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}
