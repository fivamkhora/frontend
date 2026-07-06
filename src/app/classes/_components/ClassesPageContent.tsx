"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, Eye, Search } from "lucide-react";
import {
  fetchAuthenticatedUser,
  fetchTeacherClassrooms,
  type AuthenticatedUser,
  type Classroom,
} from "@/services/authService";
import { AppLayout } from "@/app/_components/AppLayout";

type ClassItem = {
  code: string;
  id: string;
  segment: string;
  name: string;
  subject: string;
  year: string;
  color: "blue" | "lightBlue" | "green";
};

function getClassColor(index: number): ClassItem["color"] {
  const colors: ClassItem["color"][] = ["blue", "lightBlue", "green"];

  return colors[index % colors.length] ?? "blue";
}

function toClassItem(classroom: Classroom, index: number): ClassItem {
  return {
    code: classroom.code,
    color: getClassColor(index),
    id: classroom.id,
    name: classroom.name,
    segment: "TURMA",
    subject: classroom.code,
    year: classroom.schoolYear,
  };
}

function getCardHeaderClass(color: ClassItem["color"]) {
  const colors = {
    blue: "bg-[#0f4c81] text-white",
    green: "bg-[#064e3b] text-white",
    lightBlue: "bg-[#dbeafe] text-[#1e3a8a]",
  };

  return colors[color];
}

export function ClassesPageContent() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const [authenticatedUser, classrooms] = await Promise.all([
          fetchAuthenticatedUser(),
          fetchTeacherClassrooms(),
        ]);

        if (active) {
          setUser(authenticatedUser);
          setClasses(classrooms.map(toClassItem));
        }
      } catch {
        if (active) {
          setError("Nao foi possivel carregar suas turmas.");
        }
      } finally {
        if (active) {
          setLoadingClasses(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout active="classes" user={user}>
      <section className="px-8 py-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Minhas Turmas</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0f3b63]">Minhas Turmas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe suas turmas, alunos e informacoes academicas.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Pesquisar turmas"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white sm:w-80"
                />
              </label>

              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#1e3a8a]">
                <option>Ordenar por: Recentes</option>
                <option>Ordenar por: Nome</option>
                <option>Ordenar por: Maior turma</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loadingClasses && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
            Carregando turmas...
          </div>
        )}

        {!loadingClasses && !error && classes.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`p-5 ${getCardHeaderClass(item.color)}`}>
                  <span className="inline-flex rounded-md bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                    {item.segment}
                  </span>

                  <h2 className="mt-4 text-2xl font-bold">{item.name}</h2>

                  <p className="mt-1 text-sm opacity-90">{item.subject}</p>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={15} />
                    <span>Ano letivo {item.year}</span>
                  </div>

                  <Link
                    href={`/classes/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-[#1e3a8a] transition hover:bg-blue-100"
                  >
                    <Eye size={15} />
                    <span>Ver Alunos</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loadingClasses && !error && classes.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-400" size={28} />
            <h3 className="text-sm font-bold text-slate-700">
              Nenhuma turma vinculada
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Nao encontramos turmas vinculadas ao professor autenticado.
            </p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-400" size={28} />

          <h3 className="text-sm font-bold text-slate-700">
            Integracao com turmas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Esta pagina esta pronta para receber dados do BFF, como turmas
            vinculadas ao professor autenticado.
          </p>
        </div>
      </section>
    </AppLayout>
  );
}
