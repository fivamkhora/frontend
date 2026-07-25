"use client";

import { type ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import { useAuth } from "@/context/AuthContext";

type AppLayoutActiveItem =
  | "home"
  | "alunos"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "atribuirprova"
  | "provas";

type AppLayoutProps = {
  active: AppLayoutActiveItem;
  children: ReactNode;
};

export function AppLayout({ active, children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active={active} />

        <main className="min-w-0 flex-1">
          <Header user={user} />
          {children}
        </main>
      </div>
    </div>
  );
}
