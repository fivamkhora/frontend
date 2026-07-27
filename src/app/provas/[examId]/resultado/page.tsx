"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  LayoutGrid,
  LoaderCircle,
  Clock,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

type Option = {
  key: string;
  text: string;
};

type Question = {
  id: string;
  statement: string;
  type: string;
  options?: Option[];
  correctOption?: string;
  points: number;
  position: number;
};

type Answer = {
  id: string;
  questionId: string;
  selectedOption?: string;
  content?: string;
  isCorrect?: boolean;
  score?: number;
};

type SubmissionDetail = {
  id: string;
  examId: string;
  studentId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "CORRECTED" | "CLOSED";
  score: number | string | null;
  answers?: Answer[];
  createdAt: string;
};

export default function ResultadoProvaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const examId = params?.examId as string;
  const submissionId = searchParams.get("submissionId");

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!submissionId) {
        setError("Identificador da submissão não encontrado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Busca os detalhes da submissão (nota e respostas)
        const resSub = await fetch(
          `/api/avaliacao/submissions/${submissionId}`,
          {
            headers: { Accept: "application/json" },
          },
        );

        if (!resSub.ok)
          throw new Error("Não foi possível carregar a submissão.");
        const subData: SubmissionDetail = await resSub.json();
        setSubmission(subData);

        // 2. Busca as questões da prova para listar na revisão
        if (examId || subData.examId) {
          const targetExamId = examId || subData.examId;
          const resQuestions = await fetch(
            `/api/avaliacao/questions?examId=${targetExamId}`,
            { headers: { Accept: "application/json" } },
          );

          if (resQuestions.ok) {
            const questionsData = await resQuestions.json();
            setQuestions(
              Array.isArray(questionsData)
                ? questionsData.sort((a, b) => a.position - b.position)
                : [],
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar os dados.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [submissionId, examId]);

  if (loading) {
    return (
      <AppLayout active="avaliacoes">
        <div className="flex h-[75vh] flex-col items-center justify-center gap-3 text-slate-500">
          <LoaderCircle size={32} className="animate-spin text-[#0052cc]" />
          <span className="text-sm font-medium">Carregando resultado...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !submission) {
    return (
      <AppLayout active="avaliacoes">
        <div className="mx-auto my-12 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
          <p className="font-semibold">
            {error || "Resultado não encontrado."}
          </p>
          <button
            onClick={() => router.push("/avaliacoes")}
            className="mt-4 rounded-xl bg-[#0052cc] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#0043a8]"
          >
            Voltar para Minhas Avaliações
          </button>
        </div>
      </AppLayout>
    );
  }

  // 🎯 TRATAMENTO SEGURO DO SCORE (CONVERTE STRING OU NULL PARA NUMBER)
  const rawScore = submission.score;
  const parsedScore =
    typeof rawScore === "number" ? rawScore : Number(rawScore ?? 0);
  const scoreValue = isNaN(parsedScore) ? 0 : parsedScore;
  const scoreFormatted = scoreValue.toFixed(1);
  const strokeDashoffset = 283 - (283 * Math.min(scoreValue, 10)) / 10;

  // Mapeamento das respostas do aluno
  const answersMap = (submission.answers || []).reduce<Record<string, Answer>>(
    (acc, ans) => {
      acc[ans.questionId] = ans;
      return acc;
    },
    {},
  );

  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q) => {
    const ans = answersMap[q.id];
    if (ans?.isCorrect) {
      correctCount++;
    } else if (ans) {
      incorrectCount++;
    }
  });

  return (
    <AppLayout active="avaliacoes">
      <section className=" px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-b from-blue-50/60 via-white to-white p-8 text-center shadow-sm">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-6 left-12 h-3 w-3 rotate-12 rounded-sm bg-blue-500" />
            <div className="absolute top-10 right-16 h-2.5 w-2.5 rotate-45 rounded-sm bg-cyan-400" />
            <div className="absolute bottom-8 left-20 h-2 w-2 rotate-45 rounded-sm bg-amber-500" />
            <div className="absolute bottom-12 right-24 h-3 w-3 rotate-12 rounded-sm bg-emerald-400" />
            <div className="absolute top-1/2 left-8 h-2 w-2 rounded-full bg-indigo-400" />
            <div className="absolute top-1/3 right-10 h-2.5 w-2.5 rotate-12 rounded-sm bg-pink-400" />
          </div>

          <div className="relative mx-auto mb-4 flex h-36 w-36 items-center justify-center">
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-[#0052cc] transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-[#0f3b63]">
                {submission.score !== null ? scoreFormatted : "--"}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                de 10.0
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f3b63]">
            {scoreValue >= 6.0
              ? "Parabéns pelo empenho!"
              : "Avaliação Concluída!"}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-xs font-medium text-slate-500 leading-relaxed">
            {submission.score !== null
              ? "Suas respostas foram processadas com sucesso. Confira abaixo o detalhamento questão por questão."
              : "Sua prova foi entregue com sucesso! Respostas dissertativas serão revisadas pelo professor."}
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Revisão de Questões
            </h2>

            {questions.length > 0 && (
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {correctCount} Corretas
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {incorrectCount} Incorretas
                </span>
              </div>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-400">
              Nenhuma questão disponível para revisão nesta avaliação.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const answer = answersMap[q.id];
                const isCorrect = answer?.isCorrect ?? false;
                const isAnswered = Boolean(
                  answer?.selectedOption || answer?.content?.trim(),
                );

                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 shrink-0">
                        {isCorrect ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={18} />
                          </div>
                        ) : isAnswered ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                            <XCircle size={18} />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <Clock size={16} />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Questão {idx + 1} •{" "}
                          <span className="font-normal text-slate-600">
                            {q.statement}
                          </span>
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {isAnswered
                            ? answer?.selectedOption
                              ? `Sua escolha: Opção ${answer.selectedOption}`
                              : "Resposta dissertativa registrada."
                            : "Não respondida."}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 border border-slate-100">
                      {q.points} Ponto(s)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:w-auto"
          >
            <LayoutGrid size={16} /> Voltar para o Painel
          </button>
        </div>
      </section>
    </AppLayout>
  );
}
