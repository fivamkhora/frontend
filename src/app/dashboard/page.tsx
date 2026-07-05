"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FilePlus2,
  Files,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentDateLabel } from "@/services/date";
import {
  fetchAuthenticatedUser,
  logout,
  type AuthenticatedUser,
} from "@/services/authService";

export default function TemporaryDashboardPage() {
  const router = useRouter();
  const currentDateLabel = getCurrentDateLabel();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();

        if (active) {
          setUser(authenticatedUser);
        }
      } catch {
        router.push("/login");
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
          <div className="flex h-14 items-center border-b border-slate-200 px-4">
            <span className="text-sm font-semibold text-slate-900">
              {user?.name || "Professor"}
            </span>
          </div>

          <nav className="flex-1 p-3">
            <Link
              href="/dashboard"
              className="mb-1 flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-[#1e3a8a]"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              href="/classes"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <GraduationCap size={18} />
              <span>Classes</span>
            </Link>

            <Link
              href="/students"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <Users size={18} />
              <span>Students</span>
            </Link>

            <Link
              href="/confeccao"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <FilePlus2 size={18} />
              <span>Confeccionar provas</span>
            </Link>

            <Link
              href="/provas"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <Files size={18} />
              <span>Lista de provas</span>
            </Link>
          </nav>

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="h-14 border-b border-slate-200 bg-white" />

          <section className="p-8">
            <div className="border-l-2 border-[#1e3a8a] pl-5">
              <h1 className="text-2xl font-bold text-slate-900">
                Ola, {user?.name || "Professor"}!
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {currentDateLabel}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/confeccao"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                  <FilePlus2 size={22} />
                </div>

                <h2 className="text-base font-semibold text-slate-900">
                  Confeccionar prova
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Criar uma nova avaliacao escolar com apoio da plataforma.
                </p>
              </Link>

              <Link
                href="/provas"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                  <Files size={22} />
                </div>

                <h2 className="text-base font-semibold text-slate-900">
                  Lista de provas
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Visualizar, revisar e acompanhar provas ja criadas.
                </p>
              </Link>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                  <LayoutDashboard size={22} />
                </div>

                <h2 className="text-base font-semibold text-slate-900">
                  Dashboard Khora
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Login realizado com sucesso. Area pronta para integracao com
                  turmas, alunos e relatorios.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
