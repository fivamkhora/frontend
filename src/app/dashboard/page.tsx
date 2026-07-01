"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Bell,
  Moon,
  ChevronRight,
  MoreVertical,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useTurmas } from "./hooks/useTurmas";
import { TurmasGrid } from "./components/TurmasGrid";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("khora_token");
    router.push("/login");
  };

  const { turmas, isLoading, hasError } = useTurmas();

  console.log(turmas);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Procurar turmas, provas ou alunos..."
            className="w-full rounded-xl border border-transparent bg-slate-50 py-2 pr-4 pl-10 text-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <button className="rounded-full p-2 text-slate-600 transition-all hover:bg-gray-100 hover:text-slate-900">
            <Moon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
            <div className="text-right">
              <p className="text-xs leading-tight font-semibold text-slate-900">
                Prof. Ricardo
              </p>
              <p className="text-[11px] text-slate-400">Matemática</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-700">
              R
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-350 space-y-8 p-8">
        <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-[#2563eb] p-8 text-white shadow-md md:flex-row md:p-10">
          <div className="z-10 max-w-xl flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bem-vindo de volta, Ricardo.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-blue-100 opacity-90 md:text-base">
              Sua jornada de ensino facilitada pela inteligência artificial.
              Transforme horas de trabalho em minutos de criatividade.
            </p>

            <Link
              href="/confeccao"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            >
              <Sparkles size={16} className="fill-current" />
              Criar Avaliação com IA
            </Link>
          </div>

          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-blue-400/30 md:-mr-4 md:h-48 md:w-48">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/40 text-white backdrop-blur-sm">
              <Sparkles size={36} className="text-blue-200" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Minhas Turmas</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Ver todas as turmas <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-45 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
                ></div>
              ))}
            </div>
          ) : hasError ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-600">
              Não foi possível carregar as turmas. Tente novamente mais tarde.
            </div>
          ) : (
            <TurmasGrid turmas={turmas} />
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Atividades Recentes
            </h2>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100">
                Filtros
              </button>
              <button className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100">
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-6 py-4">Avaliação</th>
                  <th className="px-6 py-4">Turma</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                <tr className="transition-colors hover:bg-slate-50/40">
                  <td className="flex items-center gap-3 px-6 py-4">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        P1 - Funções Quadráticas
                      </p>
                      <p className="text-[11px] font-normal text-slate-400">
                        15 Questões • Nível Médio
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">9º Ano A</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    12 Out, 2023
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 uppercase">
                      Publicado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/40">
                  <td className="flex items-center gap-3 px-6 py-4">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Simulado Geral I
                      </p>
                      <p className="text-[11px] font-normal text-slate-400">
                        Gerando com IA...
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    1º Médio B
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">Agora</td>
                  <td className="px-6 py-4">
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase">
                      Rascunho
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/40">
                  <td className="flex items-center gap-3 px-6 py-4">
                    <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Recuperação Trimestral
                      </p>
                      <p className="text-[11px] font-normal text-slate-400">
                        Finalizado pela IA
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">8º Ano C</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    08 Out, 2023
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase">
                      Finalizado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-50 p-4 text-center">
            <button className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
