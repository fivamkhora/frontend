"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Mail,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  fetchAuthenticatedUser,
  type AuthenticatedUser,
} from "@/services/authService";
import {
  getClassroomDetails,
  type ClassroomDetails,
  type ClassroomMemberPerson,
} from "@/services/classroomService";
import { ClassesLayout } from "./ClassesLayout";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data nao informada";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function matchesStudentFilter(student: ClassroomMemberPerson, search: string) {
  const term = search.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return [student.name, student.email, student.username, String(student.userId)]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export function ClassDetailsPageContent({
  classroomId,
}: {
  classroomId: string;
}) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [details, setDetails] = useState<ClassroomDetails | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const [authenticatedUser, classroomDetails] = await Promise.all([
          fetchAuthenticatedUser(),
          getClassroomDetails(classroomId),
        ]);

        if (active) {
          setUser(authenticatedUser);
          setDetails(classroomDetails);
        }
      } catch {
        if (active) {
          setError("Nao foi possivel carregar os detalhes da turma.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [classroomId]);

  const filteredStudents = useMemo(
    () =>
      details?.students.filter((student) =>
        matchesStudentFilter(student, search),
      ) ?? [],
    [details, search],
  );

  return (
    <ClassesLayout user={user}>
      <section className="px-8 py-6">
        <Link
          href="/classes"
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#1e3a8a]"
        >
          <ArrowLeft size={16} />
          Voltar para turmas
        </Link>

        <div className="mb-6 rounded-2xl bg-[#0f4c81] p-6 text-white shadow-sm">
          <span className="inline-flex rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
            TURMA
          </span>
          <h1 className="mt-4 text-3xl font-bold">Detalhes da Turma</h1>
          <p className="mt-2 text-sm text-blue-100">
            Turma vinculada ao professor
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
            Carregando membros da turma...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {details && !loading && !error && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Corpo Docente
                  </h2>
                  <p className="text-sm text-slate-500">
                    {details.teachers.length} professor(es) vinculado(s)
                  </p>
                </div>
                <ShieldCheck className="text-[#1e3a8a]" size={24} />
              </div>

              {details.teachers.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {details.teachers.map((teacher) => (
                    <article
                      key={teacher.memberId}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-[#1e3a8a]">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {teacher.name}
                        </h3>
                        <p className="truncate text-sm text-slate-500">
                          {teacher.email}
                        </p>
                        <span className="mt-2 inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-[#1e3a8a]">
                          {teacher.role}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  Nenhum professor vinculado a esta turma.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Alunos da Turma
                  </h2>
                  <p className="text-sm text-slate-500">
                    {details.students.length} aluno(s) vinculado(s)
                  </p>
                </div>

                <label className="relative block">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filtrar por nome, email ou matricula..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white lg:w-96"
                  />
                </label>
              </div>

              {filteredStudents.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_140px] gap-4 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                    <span>Nome</span>
                    <span>E-mail</span>
                    <span>Usuario</span>
                    <span>Data de vinculo</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <article
                        key={student.memberId}
                        className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.2fr_1.4fr_1fr_140px] md:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <User size={17} />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {student.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={15} />
                          <span className="truncate">{student.email}</span>
                        </div>

                        <span className="text-slate-600">
                          {student.username || `ID ${student.userId}`}
                        </span>

                        <div className="flex items-center gap-2 text-slate-500">
                          <CalendarDays size={15} />
                          <span>{formatDate(student.createdAt)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <BookOpen className="mx-auto mb-3 text-slate-400" size={28} />
                  <h3 className="text-sm font-bold text-slate-700">
                    Nenhum aluno encontrado
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ajuste o filtro ou verifique os membros vinculados a esta
                    turma.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </ClassesLayout>
  );
}
