"use client";

import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/app/_components/AppLayout";
import { LoaderCircle } from "lucide-react";
import { ProfessorDashboard } from "./components/ProfessorDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppLayout active="home">
        <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-slate-500">
          <LoaderCircle size={32} className="animate-spin text-blue-600" />
          <span className="text-sm font-medium">Carregando painel...</span>
        </div>
      </AppLayout>
    );
  }

  const role = user?.role;

  return (
    <AppLayout active="home">
      <section className="p-8">
        {role === "Administrador" ? (
          <AdminDashboard />
        ) : role === "Aluno" ? (
          <StudentDashboard />
        ) : (
          <ProfessorDashboard />
        )}
      </section>
    </AppLayout>
  );
}
