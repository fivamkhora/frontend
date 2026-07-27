"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { toast } from "sonner";

type StudentSubmission = {
  id: string;
  examId: string;
  examTitle?: string;
  subject?: string;
  score: number | null;
  maxScore?: number;
  status: "SUBMITTED" | "CORRECTED" | "IN_PROGRESS" | "CLOSED";
  submittedAt?: string;
  updatedAt?: string;
};

export default function MinhasNotasPage() {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "CORRECTED" | "SUBMITTED"
  >("all");

  useEffect(() => {
    let active = true;

    async function loadNotas() {
      try {
        setLoading(true);
        const res = await fetch("/api/avaliacao/submissions/me", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error("Não foi possível carregar o boletim de notas.");
        }

        const data = await res.json();
        if (active) {
          setSubmissions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao carregar notas.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNotas();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const corrected = submissions.filter(
      (s) => s.status === "CORRECTED" && s.score !== null,
    );
    const totalScore = corrected.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0,
    );
    const average =
      corrected.length > 0 ? (totalScore / corrected.length).toFixed(1) : "0.0";
    const pending = submissions.filter(
      (s) => s.status === "SUBMITTED" || s.status === "IN_PROGRESS",
    ).length;

    return {
      average: Number(average),
      correctedCount: corrected.length,
      pendingCount: pending,
      total: submissions.length,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const title = (sub.examTitle || `Avaliação ${sub.examId}`).toLowerCase();
      const subject = (sub.subject || "").toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch = title.includes(term) || subject.includes(term);
      const matchesStatus =
        filterStatus === "all" ? true : sub.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, filterStatus]);

  return (
    <AppLayout active="notas">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Portal do Aluno</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Desempenho & Notas</span>
        </div>

        {/* TITULO DA PÁGINA */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3b63]">Minhas Notas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe o histórico de exames realizados, avaliações em correção e
            seu rendimento acadêmico.
          </p>
        </div>

        {/* CARDS DE RESUMO E MÉTRICAS DE DESEMPENHO */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          {/* Card 1: Média Geral */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0f3b63]">
              <Award size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Média Geral
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800">
                  {loading ? "-" : stats.average}
                </span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
            </div>
          </div>

          {/* Card 2: Provas Corrigidas */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Avaliações Corrigidas
              </span>
              <div className="text-2xl font-black text-slate-800">
                {loading ? "-" : stats.correctedCount}
              </div>
            </div>
          </div>

          {/* Card 3: Em Correção */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Em Correção
              </span>
              <div className="text-2xl font-black text-slate-800">
                {loading ? "-" : stats.pendingCount}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por prova ou matéria..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0f3b63] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0f3b63]"
            >
              <option value="all">Todos os Status</option>
              <option value="CORRECTED">Apenas Corrigidas</option>
              <option value="SUBMITTED">Em Correção</option>
            </select>
          </div>
        </div>

        {/* TABELA DE NOTAS */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-[#0f3b63]" />
            <span className="text-sm font-medium">
              Carregando seu boletim...
            </span>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_120px_100px] gap-4 bg-slate-50/80 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
              <span>Avaliação</span>
              <span>Matéria</span>
              <span>Enviado Em</span>
              <span>Status</span>
              <span className="text-right">Nota</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredSubmissions.map((sub) => {
                const title =
                  sub.examTitle || `Avaliação #${sub.examId.slice(0, 8)}`;
                const subject = sub.subject || "Geral";
                const dateText = sub.submittedAt
                  ? new Date(sub.submittedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Não informada";

                const isCorrected = sub.status === "CORRECTED";
                const score = sub.score;

                let scoreColor = "text-slate-800";
                if (isCorrected && score !== null) {
                  if (score >= 7) scoreColor = "text-emerald-600 bg-emerald-50";
                  else if (score >= 5)
                    scoreColor = "text-amber-600 bg-amber-50";
                  else scoreColor = "text-rose-600 bg-rose-50";
                }

                return (
                  <div
                    key={sub.id}
                    className="grid gap-3 px-6 py-4 text-sm transition hover:bg-slate-50/60 md:grid-cols-[1.5fr_1fr_1fr_120px_100px] md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0f3b63]">
                        <FileCheck2 size={18} />
                      </div>
                      <span className="font-bold text-slate-800">{title}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-600">
                      <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1">
                        {subject}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {dateText}
                    </span>

                    <div>
                      {isCorrected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} /> Corrigida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                          <Clock size={12} /> Em Correção
                        </span>
                      )}
                    </div>

                    {/* Nota */}
                    <div className="text-right">
                      {isCorrected && score !== null ? (
                        <span
                          className={`inline-block rounded-xl px-3 py-1 text-sm font-black ${scoreColor}`}
                        >
                          {score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-400" size={32} />
            <h3 className="text-base font-bold text-slate-700">
              Nenhuma nota registrada
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Você ainda não realizou nenhuma avaliação ou não há notas
              correspondentes à busca.
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
