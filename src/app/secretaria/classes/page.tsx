"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Eye,
  PlusCircle,
  Search,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import {
  fetchSecretariaClassrooms,
  type SecretariaClassroom,
} from "@/services/secretariaService";

type SortMode = "name" | "recent";

type ClassItem = SecretariaClassroom & {
  color: "blue" | "green" | "lightBlue";
};

function getClassColor(index: number): ClassItem["color"] {
  const colors: ClassItem["color"][] = ["blue", "lightBlue", "green"];

  return colors[index % colors.length] ?? "blue";
}

function getCardHeaderClass(color: ClassItem["color"]) {
  const colors = {
    blue: "bg-[#0f4c81] text-white",
    green: "bg-[#064e3b] text-white",
    lightBlue: "bg-[#dbeafe] text-[#1e3a8a]",
  };

  return colors[color];
}

function compareRecent(a: ClassItem, b: ClassItem) {
  const aDate = new Date(a.createdAt).getTime();
  const bDate = new Date(b.createdAt).getTime();

  return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
}

export default function SecretariaClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  useEffect(() => {
    let active = true;

    async function loadClassrooms() {
      try {
        const classrooms = await fetchSecretariaClassrooms();

        if (active) {
          setClasses(
            classrooms.map((classroom, index) => ({
              ...classroom,
              color: getClassColor(index),
            })),
          );
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar as turmas.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadClassrooms();

    return () => {
      active = false;
    };
  }, []);

  const visibleClasses = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const filtered = normalizedSearch
      ? classes.filter((classroom) =>
          [classroom.name, classroom.code, classroom.schoolYear].some((value) =>
            value.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
          ),
        )
      : [...classes];

    return filtered.sort((a, b) =>
      sortMode === "name"
        ? a.name.localeCompare(b.name, "pt-BR")
        : compareRecent(a, b),
    );
  }, [classes, search, sortMode]);

  return (
    <AppLayout active="secretaria">
      <section className="px-8 py-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Secretaria</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Classes</span>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0f3b63]">Turmas</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulte as turmas cadastradas e seus vinculos academicos.
            </p>
          </div>

          <Link
            href="/secretaria/classes/configuracao"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#062f46]"
          >
            <PlusCircle size={17} />
            Criar nova turma
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar turmas"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white sm:w-80"
              />
            </label>

            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              aria-label="Ordenar turmas"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#1e3a8a]"
            >
              <option value="recent">Ordenar por: Recentes</option>
              <option value="name">Ordenar por: Nome</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
            Carregando turmas...
          </div>
        )}

        {!loading && !error && visibleClasses.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleClasses.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`p-5 ${getCardHeaderClass(item.color)}`}>
                  <span className="inline-flex rounded-md bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                    Turma
                  </span>
                  <h2 className="mt-4 text-2xl font-bold">{item.name}</h2>
                  <p className="mt-1 text-sm opacity-90">
                    {item.code || "Codigo nao informado"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={15} />
                    <span>
                      {item.schoolYear
                        ? `Ano letivo ${item.schoolYear}`
                        : "Ano letivo nao informado"}
                    </span>
                  </div>

                  <Link
                    href={`/classes/${item.id}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-[#1e3a8a] transition hover:bg-blue-100"
                  >
                    <Eye size={15} />
                    Ver turma
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && visibleClasses.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-400" size={28} />
            <h3 className="text-sm font-bold text-slate-700">
              {search ? "Nenhuma turma encontrada" : "Nenhuma turma cadastrada"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Revise os termos usados na pesquisa."
                : "Crie uma nova turma para iniciar a organizacao das classes."}
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
