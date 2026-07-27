"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getCurrentDateLabel } from "@/services/date";
import { useAuth } from "@/context/AuthContext";

export function StudentDashboard() {
  const currentDateLabel = getCurrentDateLabel();
  const { user } = useAuth();

  return (
    <>
      {/* Banner de Boas-vindas do Aluno */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f4c81] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="z-10 flex-1 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Bons estudos, {user?.name || "Aluno"}! 🎓
          </h1>
          <p className="mt-1 text-sm text-blue-100">{currentDateLabel}</p>
          <p className="mt-2 text-sm text-blue-100 md:text-base leading-relaxed">
            Acompanhe suas avaliações pendentes, fique por dentro dos prazos e
            confira seus resultados mais recentes.
          </p>
          <Link
            href="/avaliacoes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0f4c81] transition hover:bg-blue-50 shadow-sm"
          >
            <BookOpen size={16} />
            Ver Minhas Avaliações
          </Link>
        </div>

        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-white/10 text-white md:h-44 md:w-44">
          <GraduationCap size={64} />
        </div>
      </div>

      {/* Cards de Atalho Rápido para o Aluno */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0f4c81] mb-4">
              <Calendar size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Avaliações Pendentes
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Verifique as provas disponíveis para responder no seu portal.
            </p>
          </div>
          <Link
            href="/avaliacoes"
            className="mt-6 flex items-center gap-2 text-xs font-bold text-[#0f4c81] hover:underline"
          >
            Ir para avaliações <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Minhas Turmas</h3>
            <p className="mt-1 text-xs text-slate-500">
              Consulte os colegas de classe e professores das suas turmas.
            </p>
          </div>
          <Link
            href="/classes"
            className="mt-6 flex items-center gap-2 text-xs font-bold text-[#0f4c81] hover:underline"
          >
            Ver minhas turmas <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
