"use client";

import Link from "next/link";
import { Brain, Sparkles } from "lucide-react";
import { getCurrentDateLabel } from "@/services/date";
import { useAuth } from "@/context/AuthContext";
import Turmas from "./Turmas";
import Provas from "./Provas";

export function ProfessorDashboard() {
  const currentDateLabel = getCurrentDateLabel();
  const { user } = useAuth();

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="z-10 flex-1 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Bem-vindo de volta, {user?.name || "Professor"}.
          </h1>
          <p className="mt-1 text-sm text-blue-100">{currentDateLabel}</p>
          <p className="mt-2 text-sm text-blue-100 md:text-base leading-relaxed">
            Sua jornada de ensino facilitada pela inteligência artificial.
            Transforme horas de trabalho em minutos de criatividade.
          </p>
          <Link
            href="/confeccao"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 shadow-sm"
          >
            <Sparkles size={16} className="fill-current" />
            Criar Avaliação com IA
          </Link>
        </div>

        <div className="relative animate-pulse [animate-duration:3000ms] flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-blue-400/40 md:h-48 md:w-48">
          <div className="bg-blue-600 p-4 rounded-full text-white flex items-center justify-center h-16 w-16">
            <Brain size={30} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Turmas />
      </div>

      <div className="mt-8">
        <Provas />
      </div>
    </>
  );
}
