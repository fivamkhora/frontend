"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Eye,
  LoaderCircle,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { useAuth } from "@/context/AuthContext";

type ClassroomItem = {
  id: string | number;
  name?: string;
  classroomName?: string;
  code?: string;
  classroomCode?: string;
  schoolYear?: string;
  createdAt?: string;
  members?: any[];
};

const CARD_THEMES = [
  {
    bgHeader: "bg-[#064e3b]",
    textColor: "text-white",
    badgeBg: "bg-white/20 text-white",
    codeColor: "text-emerald-200",
  },
  {
    bgHeader: "bg-[#dbeafe]",
    textColor: "text-[#1e3a8a]",
    badgeBg: "bg-[#bfdbfe] text-[#1e3a8a]",
    codeColor: "text-[#3b82f6]",
  },
  {
    bgHeader: "bg-[#0f4c81]",
    textColor: "text-white",
    badgeBg: "bg-white/20 text-white",
    codeColor: "text-blue-200",
  },
];

export function ClassesPageContent() {
  const { user, hasRole } = useAuth();

  const isAdmin = hasRole(["Administrador"]);

  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "name">(
    "recent",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClassrooms() {
      try {
        setLoading(true);

        const url = isAdmin ? "/api/turma/classrooms" : "/api/turma/classrooms";

        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("Erro ao carregar turmas");

        const data = await res.json();
        setClassrooms(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Não foi possível carregar a lista de turmas.");
      } finally {
        setLoading(false);
      }
    }

    loadClassrooms();
  }, [isAdmin]);

  const filteredAndSortedClassrooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = classrooms.filter((c) => {
      const name = (c.name || c.classroomName || "").toLowerCase();
      const code = (c.code || c.classroomCode || "").toLowerCase();
      const year = String(c.schoolYear || "").toLowerCase();

      return name.includes(term) || code.includes(term) || year.includes(term);
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "name") {
        const nameA = a.name || a.classroomName || "";
        const nameB = b.name || b.classroomName || "";
        return nameA.localeCompare(nameB);
      }
      if (sortOrder === "oldest") {
        return String(a.id).localeCompare(String(b.id));
      }
      return String(b.id).localeCompare(String(a.id));
    });
  }, [classrooms, search, sortOrder]);

  return (
    <AppLayout active="classes">
      <section className="px-8 py-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">
            {isAdmin ? "Todas as Turmas" : "Minhas Turmas"}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#0f3b63]">
              {isAdmin ? "Gestão Geral de Turmas" : "Minhas Turmas"}
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck size={14} /> Visão Global (Admin)
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Acompanhe todas as turmas cadastradas na instituição, professores e alunos vinculados."
              : "Acompanhe suas turmas, alunos e informações acadêmicas."}
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar turmas por nome, código ou ano..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0f3b63] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0f3b63]"
            >
              <option value="recent">Ordenar por: Recentes</option>
              <option value="oldest">Ordenar por: Antigos</option>
              <option value="name">Ordenar por: Nome</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-[#0f3b63]" />
            <span className="text-sm font-medium">
              {isAdmin
                ? "Carregando todas as turmas..."
                : "Carregando suas turmas..."}
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredAndSortedClassrooms.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedClassrooms.map((c, index) => {
                  const id = c.id;
                  const name = c.name || c.classroomName || "Turma";
                  const code = c.code || c.classroomCode || "";
                  const schoolYear = c.schoolYear || "2026";

                  const theme = CARD_THEMES[index % CARD_THEMES.length];

                  return (
                    <div
                      key={id}
                      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        className={`p-6 ${theme.bgHeader} ${theme.textColor}`}
                      >
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${theme.badgeBg}`}
                        >
                          TURMA
                        </span>

                        <h2 className="mt-3 text-2xl font-black tracking-tight leading-tight">
                          {name}
                        </h2>

                        {code && (
                          <p
                            className={`mt-1 text-xs font-bold ${theme.codeColor}`}
                          >
                            {code}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Calendar size={15} className="text-slate-400" />
                          <span>Ano letivo {schoolYear}</span>
                        </div>

                        <Link
                          href={`/classes/${id}`}
                          className="flex items-center gap-2 rounded-xl bg-blue-50/80 px-4 py-2 text-xs font-bold text-[#1e3a8a] transition hover:bg-blue-100"
                        >
                          <Eye size={15} />
                          <span>Ver Detalhes</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <BookOpen className="mx-auto mb-3 text-slate-400" size={32} />
                <h3 className="text-base font-bold text-slate-700">
                  Nenhuma turma encontrada
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isAdmin
                    ? "Não existem turmas cadastradas no sistema."
                    : "Você não possui nenhuma turma vinculada."}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </AppLayout>
  );
}
