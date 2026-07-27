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
  LoaderCircle,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

type MemberItem = {
  id: string;
  classroomId: string;
  userId: number | string;
  role: string; // "Professor" ou "Aluno"
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    username?: string;
  };
};

function formatDate(value?: string) {
  if (!value) return "Data não informada";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ClassDetailsPageContent({
  classroomId,
}: {
  classroomId: string;
}) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        setLoading(true);
        setError("");

        // Busca os membros da turma específica via UUID
        const res = await fetch(
          `/api/turma/classrooms/${classroomId}/members`,
          {
            headers: { Accept: "application/json" },
          },
        );

        if (!res.ok) {
          throw new Error("Não foi possível carregar os membros da turma.");
        }

        const data: MemberItem[] = await res.json();

        if (active) {
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao buscar membros da turma.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (classroomId) {
      loadMembers();
    }

    return () => {
      active = false;
    };
  }, [classroomId]);

  const teachers = useMemo(() => {
    return members.filter((m) => {
      const r = String(m.role || "").toLowerCase();
      return r === "professor" || r === "teacher" || r === "admin";
    });
  }, [members]);

  const students = useMemo(() => {
    return members.filter((m) => {
      const r = String(m.role || "").toLowerCase();
      return r === "aluno" || r === "student" || !teachers.includes(m);
    });
  }, [members, teachers]);

  // Filtra Alunos pela busca
  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;

    return students.filter((s) => {
      const name = s.user?.name || `Usuário ${s.userId}`;
      const email = s.user?.email || "";
      const userId = String(s.userId);

      return [name, email, userId].join(" ").toLowerCase().includes(term);
    });
  }, [students, search]);

  return (
    <AppLayout active="classes">
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
          <h1 className="mt-4 text-3xl font-bold">Membros da Turma</h1>
          <p className="mt-2 text-sm text-blue-100">
            Membros e alunos vinculados a este código de turma.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-12 text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-[#1e3a8a]" />
            <span className="text-sm font-medium">
              Carregando membros da turma...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* CORPO DOCENTE / PROFESSORES */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Corpo Docente
                  </h2>
                  <p className="text-sm text-slate-500">
                    {teachers.length} professor(es) vinculado(s)
                  </p>
                </div>
                <ShieldCheck className="text-[#1e3a8a]" size={24} />
              </div>

              {teachers.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {teachers.map((teacher) => (
                    <article
                      key={teacher.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-[#1e3a8a]">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {teacher.user?.name ||
                            `Professor (ID ${teacher.userId})`}
                        </h3>
                        <p className="truncate text-sm text-slate-500">
                          {teacher.user?.email ||
                            `ID do Usuário: ${teacher.userId}`}
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
                    {students.length} aluno(s) vinculado(s)
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
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar por nome ou ID..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white lg:w-96"
                  />
                </label>
              </div>

              {filteredStudents.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_140px] gap-4 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                    <span>Nome / Identificação</span>
                    <span>E-mail</span>
                    <span>ID Usuário</span>
                    <span>Data de vínculo</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <article
                        key={student.id}
                        className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.2fr_1.4fr_1fr_140px] md:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <User size={17} />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {student.user?.name || `Aluno ${student.userId}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={15} />
                          <span className="truncate">
                            {student.user?.email || "E-mail não cadastrado"}
                          </span>
                        </div>

                        <span className="text-slate-600 font-medium">
                          ID: {student.userId}
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
                    Não existem alunos cadastrados com estes filtros.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
