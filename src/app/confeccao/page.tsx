"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  LoaderCircle,
  Menu,
  Sparkles,
} from "lucide-react";

type AssessmentResponse = {
  data: {
    id: string;
    currentVersion: {
      version: number;
      assessment: {
        title: string;
        instructions: string;
        questions: unknown[];
        answerKey: unknown[];
      };
    };
    versions: unknown[];
  };
};

const assessmentTypes = [
  { label: "Prova", value: "prova" },
  { label: "Quiz", value: "quiz" },
  { label: "Trabalho", value: "trabalho" },
] as const;

const difficulties = [
  { label: "Fácil", value: "facil" },
  { label: "Médio", value: "medio" },
  { label: "Difícil", value: "dificil" },
] as const;

const materiaisBase =
  "O ciclo da água é o movimento contínuo da água em nosso planeta. Ele envolve processos como a evaporação, passagem do estado líquido para o gasoso devido ao calor do Sol, condensação, formação de nuvens, e precipitação, chuva. A água também infiltra no solo, alimentando lençóis freáticos.";

export default function ConfeccaoProvasPage() {
  const [materia, setMateria] = useState("Ciências");
  const [anoEscolar, setAnoEscolar] = useState("6º ano");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("prova");
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(10);
  const [dificuldade, setDificuldade] = useState("medio");
  const [material, setMaterial] = useState(materiaisBase);
  const [instrucoes, setInstrucoes] = useState(
    "Inclua duas questões dissertativas",
  );
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");

  const resumoConfiguracao = useMemo(
    () =>
      `${materia} | ${anoEscolar} | ${tipoAvaliacao} | ${quantidadeQuestoes} questões`,
    [materia, anoEscolar, quantidadeQuestoes, tipoAvaliacao],
  );

  const gerarAvaliacao = async () => {
    setLoading(true);
    setResultado("");
    setError("");

    try {
      const response = await fetch("/api/v1/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          subject: materia,
          gradeLevel: anoEscolar,
          classroomMaterial: material,
          assessmentType: tipoAvaliacao,
          questionCount: quantidadeQuestoes,
          difficulty: dificuldade,
          teacherInstructions: instrucoes,
        }),
      });

      const data = (await response.json()) as AssessmentResponse | {
        error?: string;
        message?: string;
        upstreamStatus?: number;
        upstreamPath?: string;
      };

      if (!response.ok) {
        const upstreamDetail =
          "upstreamStatus" in data && data.upstreamStatus
            ? ` BFF respondeu ${data.upstreamStatus}${
                data.upstreamPath ? ` em ${data.upstreamPath}` : ""
              }.`
            : "";

        throw new Error(
          "error" in data
            ? `${data.error}${upstreamDetail}`
            : "message" in data
              ? data.message
              : "Nao foi possivel gerar a avaliacao.",
        );
      }

      setResultado(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel gerar a avaliacao.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold text-[#1e3a8a]"
            >
              <Brain size={24} />
              <span>Khora AI</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 hover:bg-slate-100 hover:text-slate-900"
            >
              Início
            </Link>
            <Link
              href="/confeccao"
              className="rounded-lg bg-[#1e3a8a] px-4 py-2 text-white shadow-sm"
            >
              Provas
            </Link>
            <Link
              href="/provas"
              className="rounded-lg px-4 py-2 hover:bg-slate-100 hover:text-slate-900"
            >
              Listagem de provas criadas
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[380px_1fr] md:px-8 md:py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Configuração Base
              </h1>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {resumoConfiguracao}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Matéria
              </span>
              <input
                type="text"
                value={materia}
                onChange={(event) => setMateria(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ano Escolar
              </span>
              <select
                value={anoEscolar}
                onChange={(event) => setAnoEscolar(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>6º ano</option>
                <option>7º ano</option>
                <option>8º ano</option>
                <option>9º ano</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tipo de Avaliação
              </span>
              <select
                value={tipoAvaliacao}
                onChange={(event) => setTipoAvaliacao(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {assessmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Questões
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantidadeQuestoes}
                  onChange={(event) =>
                    setQuantidadeQuestoes(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Dificuldade
                </span>
                <select
                  value={dificuldade}
                  onChange={(event) => setDificuldade(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Sparkles size={18} />
              Otimização com IA
            </div>
            <p className="leading-relaxed text-blue-900">
              Sua avaliação será otimizada com a inteligência artificial da
              Khora.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Material e Contexto
              </h2>
              <p className="text-sm text-slate-500">
                Base de conteúdo usada para gerar a prova.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Material de Aula Conteúdo
              </span>
              <textarea
                rows={8}
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                className="min-h-48 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Instruções Adicionais
              </span>
              <input
                type="text"
                value={instrucoes}
                onChange={(event) => setInstrucoes(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={gerarAvaliacao}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#123a60] disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Gerando avaliação...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Gerar Avaliação com IA
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {resultado && (
            <section className="mt-6 rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100">
              <h3 className="mb-3 text-base font-bold">Avaliação Gerada</h3>
              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-100">
                {resultado}
              </pre>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
