"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  FilePlus2,
  Files,
  GraduationCap,
  Home,
  LogOut,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logout, type AuthenticatedUser } from "@/services/authService";

type ClassesLayoutProps = {
  active?: "classes" | "home" | "students";
  children: ReactNode;
  user: AuthenticatedUser | null;
};

export function ClassesLayout({
  active = "classes",
  children,
  user,
}: ClassesLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getNavClassName = (item: ClassesLayoutProps["active"]) =>
    item === active
      ? "mb-1 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-[#1e3a8a]"
      : "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]";

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
            <Link href="/dashboard" className={getNavClassName("home")}>
              <Home size={17} />
              <span>Home</span>
            </Link>

            <Link href="/classes" className={getNavClassName("classes")}>
              <GraduationCap size={17} />
              <span>Classes</span>
            </Link>

            <Link href="/students" className={getNavClassName("students")}>
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
          {children}
        </main>
      </div>
    </div>
  );
}
