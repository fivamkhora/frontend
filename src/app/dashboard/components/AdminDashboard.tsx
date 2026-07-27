"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  School,
  FileCheck,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getCurrentDateLabel } from "@/services/date";
import { useAuth } from "@/context/AuthContext";

export function AdminDashboard() {
  const currentDateLabel = getCurrentDateLabel();
  const { user } = useAuth();

  return (
    <>
      {/* Banner da Secretaria */}
      <div className="relative overflow-hidden rounded-2xl bg-[#064e3b] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="z-10 flex-1 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck size={14} /> Painel Administrativo • Secretaria
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Olá, {user?.name || "Administrador"}.
          </h1>
          <p className="mt-1 text-sm text-emerald-100">{currentDateLabel}</p>
          <p className="mt-2 text-sm text-emerald-100 md:text-base leading-relaxed">
            Gerencie turmas, alunos, professores e acompanhe o fluxo de
            avaliações acadêmicas de toda a instituição.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#064e3b] transition hover:bg-emerald-50 shadow-sm"
            >
              <School size={16} />
              Gerenciar Turmas
            </Link>

            <Link
              href="/classes/nova"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <PlusCircle size={16} />
              Nova Turma
            </Link>
          </div>
        </div>

        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-white/10 text-white md:h-44 md:w-44">
          <Building2 size={64} />
        </div>
      </div>

      {/* Cards de Métricas e Ações Rápidas para a Secretaria */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Card 1: Turmas e Classes */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#064e3b] mb-4">
              <School size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Turmas & Matrículas
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Consulte e organize turmas cadastradas, matricule alunos e vincule
              professores.
            </p>
          </div>
          <Link
            href="/classes"
            className="mt-6 flex items-center gap-2 text-xs font-bold text-[#064e3b] hover:underline"
          >
            Acessar Turmas <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Usuários e Membros */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Corpo Docente e Discente
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Visualize dados gerais de professores, alunos e perfis de acesso
              do sistema.
            </p>
          </div>
          <Link
            href="/classes"
            className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-700 hover:underline"
          >
            Listar Membros <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Auditoria de Provas */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4">
              <FileCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Relatório de Avaliações
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Acompanhe o engajamento e a aplicação de exames nas turmas da
              instituição.
            </p>
          </div>
          <Link
            href="/avaliacoes"
            className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-700 hover:underline"
          >
            Ver Avaliações <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
