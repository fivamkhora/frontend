"use client";

import React from "react";
import { Plus, GraduationCap } from "lucide-react";
import { Turma } from "../modules/getTurmas";

interface TurmasGridProps {
  turmas: Turma[];
  onAdicionarTurma?: () => void;
}

export function TurmasGrid({ turmas, onAdicionarTurma }: TurmasGridProps) {
  const estilosCores = [
    {
      borda: "border-l-blue-500",
      texto: "text-blue-600",
      bgTag: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      borda: "border-l-amber-500",
      texto: "text-amber-600",
      bgTag: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      borda: "border-l-teal-500",
      texto: "text-teal-600",
      bgTag: "bg-teal-50 text-teal-700 border-teal-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {turmas?.map((turma, index) => {
        const cor = estilosCores[index % estilosCores.length];

        return (
          <div
            key={turma.id}
            className={`flex min-h-37.5 flex-col justify-between rounded-2xl border-y border-r border-l-4 border-slate-100 ${cor.borda} bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm font-bold tracking-tight ${cor.texto}`}
                >
                  {turma.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cor.bgTag}`}
                >
                  <GraduationCap className="h-3 w-3" />
                  {turma.schoolYear}
                </span>
              </div>

              <h4 className="font-mono text-xs font-medium tracking-wider text-slate-400 uppercase">
                {turma.code}
              </h4>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-[11px] text-slate-400">
              <span>Turma ativa</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </div>
          </div>
        );
      })}

      <button
        onClick={onAdicionarTurma}
        className="group flex min-h-37.5 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-slate-400 transition-all hover:border-blue-300 hover:bg-blue-50/20 hover:text-blue-600"
      >
        <div className="rounded-full border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:border-blue-100 group-hover:bg-white">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold">Adicionar Nova Turma</span>
      </button>
    </div>
  );
}
