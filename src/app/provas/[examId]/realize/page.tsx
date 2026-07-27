"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  LoaderCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Send,
  HelpCircle,
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
  points: string | number;
  position: number;
};

type AnswerState = {
  answerId?: string;
  selectedOption?: string;
  content?: string;
};

export default function RealizeProvaPage() {
  const { examId } = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const submissionId = searchParams.get("submissionId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [answersMap, setAnswersMap] = useState<Record<string, AnswerState>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/avaliacao/questions?examId=${examId}`, {
          headers: {
            Accept: "application/json",
          },
        });
        const data = await res.json();

        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => a.position - b.position,
        );
        setQuestions(sorted);
      } catch (err) {
        console.error("Erro ao carregar questões", err);
      } finally {
        setLoading(false);
      }
    }

    if (examId) fetchQuestions();
  }, [examId]);

  async function handleOptionSelect(questionId: string, optionKey: string) {
    if (!submissionId) {
      alert("Submissão não encontrada. Inicie a prova novamente.");
      return;
    }

    const currentAnswer = answersMap[questionId];
    if (currentAnswer?.selectedOption === optionKey) return;

    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOption: optionKey },
    }));

    setSavingQuestionId(questionId);

    try {
      if (currentAnswer?.answerId) {
        await fetch(`/api/avaliacao/answers/${currentAnswer.answerId}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedOption: optionKey,
          }),
        });
      } else {
        const res = await fetch("/api/avaliacao/answers", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
            questionId,
            selectedOption: optionKey,
            content: "",
          }),
        });

        if (res.ok) {
          const createdAnswer = await res.json();
          setAnswersMap((prev) => ({
            ...prev,
            [questionId]: {
              answerId: createdAnswer.id,
              selectedOption: optionKey,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao salvar resposta no servidor", err);
    } finally {
      setSavingQuestionId(null);
    }
  }

  async function handleTextChange(questionId: string, text: string) {
    if (!submissionId) return;

    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], content: text },
    }));
  }

  async function handleTextBlur(questionId: string) {
    const currentAnswer = answersMap[questionId];
    if (!submissionId || !currentAnswer?.content) return;

    setSavingQuestionId(questionId);

    try {
      if (currentAnswer?.answerId) {
        await fetch(`/api/avaliacao/answers/${currentAnswer.answerId}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: currentAnswer.content,
          }),
        });
      } else {
        const res = await fetch("/api/avaliacao/answers", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
            questionId,
            content: currentAnswer.content,
          }),
        });

        if (res.ok) {
          const createdAnswer = await res.json();
          setAnswersMap((prev) => ({
            ...prev,
            [questionId]: {
              ...prev[questionId],
              answerId: createdAnswer.id,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao salvar resposta dissertativa", err);
    } finally {
      setSavingQuestionId(null);
    }
  }

  async function handleFinishExam() {
    if (!submissionId) return;

    const confirmed = window.confirm(
      "Deseja realmente finalizar e entregar a sua prova?",
    );
    if (!confirmed) return;

    try {
      setSubmittingExam(true);

      const res = await fetch(`/api/avaliacao/submissions/${submissionId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SUBMITTED" }),
      });

      if (!res.ok) {
        throw new Error("Não foi possível finalizar a submissão.");
      }

      router.push(`/provas/${examId}/resultado?submissionId=${submissionId}`);
    } catch (err) {
      alert("Erro ao entregar a prova. Tente novamente.");
    } finally {
      setSubmittingExam(false);
    }
  }

  if (loading) {
    return (
      <AppLayout active="avaliacoes">
        <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
          <LoaderCircle size={32} className="animate-spin text-[#0052cc]" />
          <span className="text-sm font-medium text-slate-500">
            Carregando questões da prova...
          </span>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout active="avaliacoes">
        <div className="mx-auto my-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Nenhuma questão disponível
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Esta prova não possui questões cadastradas ou disponíveis no
            momento.
          </p>
          <button
            onClick={() => router.push("/avaliacoes")}
            className="mt-6 rounded-xl bg-[#0052cc] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#0043a8]"
          >
            Voltar para Avaliações
          </button>
        </div>
      </AppLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentSelectedOption = answersMap[currentQuestion.id]?.selectedOption;
  const currentTextAnswer = answersMap[currentQuestion.id]?.content || "";
  const isEssay = currentQuestion.type === "ESSAY";

  const answeredCount = Object.values(answersMap).filter(
    (a) => a.selectedOption || (a.content && a.content.trim().length > 0),
  ).length;

  const progressPercentage = Math.round(
    (answeredCount / questions.length) * 100,
  );

  return (
    <AppLayout active="avaliacoes">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* CABEÇALHO DA PROVA */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Avaliações</span>
              <span>&gt;</span>
              <span className="text-[#1e3a8a]">Em Andamento</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0f3b63]">
              Resolução de Prova
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {savingQuestionId === currentQuestion.id && (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#0052cc]">
                <LoaderCircle size={14} className="animate-spin" /> Salvando...
              </span>
            )}
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              Progresso: <span className="text-[#0052cc]">{answeredCount}</span>
              /{questions.length} ({progressPercentage}%)
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-[#0052cc] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* NAVEGADOR RÁPIDO DE QUESTÕES */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="mr-2 text-xs font-bold text-slate-500">
            Questões:
          </span>
          {questions.map((q, idx) => {
            const isAnswered =
              Boolean(answersMap[q.id]?.selectedOption) ||
              Boolean(answersMap[q.id]?.content?.trim());
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                  isCurrent
                    ? "bg-[#0052cc] text-white ring-2 ring-[#0052cc] ring-offset-2"
                    : isAnswered
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* CARD DA QUESTÃO ATUAL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052cc]">
              Questão {currentIndex + 1} de {questions.length}
            </span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {currentQuestion.points} Ponto(s)
            </span>
          </div>

          <h2 className="mb-6 text-base font-bold text-slate-800 leading-relaxed sm:text-lg">
            {currentQuestion.statement}
          </h2>

          {/* QUESTÃO DISSERTATIVA */}
          {isEssay ? (
            <div className="mb-8 space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Sua Resposta:
              </label>
              <textarea
                rows={6}
                value={currentTextAnswer}
                onChange={(e) =>
                  handleTextChange(currentQuestion.id, e.target.value)
                }
                onBlur={() => handleTextBlur(currentQuestion.id)}
                placeholder="Digite sua resposta aqui..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition focus:border-[#0052cc] focus:bg-white"
              />
              <span className="block text-[11px] text-slate-400">
                Sua resposta é salva automaticamente ao clicar fora do campo.
              </span>
            </div>
          ) : (
            /* QUESTÃO OBJETIVA / MULTIPLA ESCOLHA */
            <div className="mb-8 space-y-3">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option) => {
                  const isSelected = currentSelectedOption === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() =>
                        handleOptionSelect(currentQuestion.id, option.key)
                      }
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#0052cc] bg-blue-50/60 text-[#0052cc] font-medium shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? "bg-[#0052cc] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {option.key}
                      </span>
                      <span className="text-sm leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Nenhuma alternativa cadastrada para esta questão.
                </p>
              )}
            </div>
          )}

          {/* CONTROLES DE NAVEGAÇÃO E CONCLUSÃO */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                disabled={submittingExam}
                onClick={handleFinishExam}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {submittingExam ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    <span>Entregando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Entregar Prova</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0052cc] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0043a8]"
              >
                <span>Próxima</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
