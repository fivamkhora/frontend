"use client";

import React from "react";
import { Plus, ArrowRight, GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";

// Interface baseada no formato do seu objeto de dados
interface TurmaProps {
  id: string;
  name: string;
  code: string;
  schoolYear: string;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
}

interface MinhasTurmasProps {
  turmas?: TurmaProps[];
}

// Dados mockados padrão (caso você ainda não esteja passando os dados reais via API)
const turmasMockPadrao: TurmaProps[] = [
  {
    id: "7af02e25-90f7-4e76-9e14-f2cfbb0b9017",
    name: "Turma 1A",
    code: "TURMA-RWN6AR",
    schoolYear: "2026",
    teacherId: 1,
    createdAt: "2026-07-01T22:33:56.906Z",
    updatedAt: "2026-07-01T22:33:56.906Z",
  },
  {
    id: "outro-id-2",
    name: "Turma 2B",
    code: "TURMA-ABC123",
    schoolYear: "2026",
    teacherId: 1,
    createdAt: "2026-07-01T22:33:56.906Z",
    updatedAt: "2026-07-01T22:33:56.906Z",
  },
  {
    id: "outro-id-2",
    name: "Turma 2B",
    code: "TURMA-ABC123",
    schoolYear: "2026",
    teacherId: 1,
    createdAt: "2026-07-01T22:33:56.906Z",
    updatedAt: "2026-07-01T22:33:56.906Z",
  },
];

export default function Turmas({
  turmas = turmasMockPadrao,
}: MinhasTurmasProps) {
  return (
    <div className="w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Minhas Turmas</h2>
        <Link
          href="/classes"
          className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
        >
          Ver todas as turmas
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {turmas.map((turma) => (
          <div
            key={turma.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 border-l-[6px] border-l-blue-600 p-5 flex flex-col justify-between h-[180px] transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Informações Principais (Nome da Turma) */}
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Turma Ativa
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-1 flex items-center gap-2">
                <GraduationCap className="text-blue-600 h-5 w-5 shrink-0" />
                {turma.name}
              </h3>
            </div>

            {/* Ano Letivo e Código da Turma */}
            <div className="space-y-1.5 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  Ano Letivo: <strong>{turma.schoolYear}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Cód: {turma.code}
              </div>
            </div>
          </div>
        ))}

        {/* Card para Adicionar Nova Turma */}
        <button className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-transparent rounded-2xl p-5 flex flex-col items-center justify-center gap-3 h-[180px] text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
          <div className="p-2 bg-white rounded-full border border-slate-200 shadow-sm">
            <Plus size={20} className="text-slate-500" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            Adicionar Turma
          </span>
        </button>
      </div>
    </div>
  );
}
