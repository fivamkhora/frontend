"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Eye,
  FilePlus2,
  Files,
  GraduationCap,
  Home,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  fetchAuthenticatedUser,
  fetchTeacherClassrooms,
  logout,
  type AuthenticatedUser,
  type Classroom,
} from "@/services/authService";

type ClassItem = {
  code: string;
  id: string;
  segment: string;
  name: string;
  subject: string;
  shift: string;
  students: number;
  year: string;
  color: "blue" | "lightBlue" | "green";
};

function getClassColor(index: number): ClassItem["color"] {
  const colors: ClassItem["color"][] = ["blue", "lightBlue", "green"];

  return colors[index % colors.length];
}

function toClassItem(classroom: Classroom, index: number): ClassItem {
  return {
    code: classroom.code,
    color: getClassColor(index),
    id: classroom.id,
    name: classroom.name,
    segment: "TURMA",
    shift: "Turno nao informado",
    students: 0,
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

export default function ClassesPage() {
  const router = useRouter();
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
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <aside className="relative flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-16 items-center border-b border-slate-200 px-5">
            <span className="text-sm font-semibold text-slate-900">
              {user?.name || "Professor"}
            </span>
          </div>

          <nav className="flex-1 p-3">
            <Link
              href="/dashboard"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <Home size={17} />
              <span>Home</span>
            </Link>

            <Link
              href="/classes"
              className="mb-1 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-[#1e3a8a]"
            >
              <GraduationCap size={17} />
              <span>Classes</span>
            </Link>

            <Link
              href="/students"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <Users size={17} />
              <span>Students</span>
            </Link>

            <Link
              href="/confeccao"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <FilePlus2 size={17} />
              <span>Confeccionar provas</span>
            </Link>

            <Link
              href="/provas"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <Files size={17} />
              <span>Lista de provas</span>
            </Link>
          </nav>

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="h-16 border-b border-slate-200 bg-white" />

          <section className="px-8 py-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Painel</span>
              <span>&gt;</span>
              <span className="text-[#1e3a8a]">Minhas Turmas</span>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#0f3b63]">
                Minhas Turmas
              </h1>
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

                    <div className="border-b border-slate-100 px-5 py-4">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock size={15} />
                          <span>{item.shift}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={15} />
                          <span>{item.students} alunos vinculados</span>
                        </div>
                      </div>
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
        </main>
      </div>
    </div>
  );
}
