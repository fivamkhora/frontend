"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Search,
  LoaderCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { fetchTeacherClassrooms, type Classroom } from "@/services/authService";
import {
  toAssessmentItem,
  type AssessmentItem,
  type AssessmentsResponse,
} from "@/app/provas/page";
import { toast } from "sonner";

export default function AplicarProvaPage() {
  const router = useRouter();

  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [examSearch, setExamSearch] = useState("");
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<string[]>(
    [],
  );

  const [availableAt, setAvailableAt] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(60);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        const [resAssessments, classroomsData] = await Promise.all([
          fetch("/api/ia/assessments", {
            method: "GET",
            headers: { Accept: "application/json" },
          }),
          fetchTeacherClassrooms(),
        ]);

        if (resAssessments.ok) {
          const payload = (await resAssessments.json()) as AssessmentsResponse;

          if (Array.isArray(payload.data)) {
            const items = payload.data.map(toAssessmentItem);
            setAssessments(items);
          } else {
            setAssessments([]);
          }
        }

        setClassrooms(classroomsData || []);
      } catch {
        setError("Não foi possível carregar os modelos de avaliação.");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function toggleClassroom(id: string) {
    setSelectedClassroomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSelectAllClassrooms() {
    if (selectedClassroomIds.length === classrooms.length) {
      setSelectedClassroomIds([]);
    } else {
      setSelectedClassroomIds(classrooms.map((c) => c.id));
    }
  }

  async function handleConfirmApplication() {
    if (!selectedAssessmentId) {
      toast.info("Por favor, selecione um modelo de avaliação.");
      return;
    }

    if (selectedClassroomIds.length === 0) {
      toast.info("Selecione ao menos uma turma para aplicar a prova.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      for (const classroomId of selectedClassroomIds) {
        const importRes = await fetch(
          `/api/avaliacao/exams/import/api-ia/${encodeURIComponent(selectedAssessmentId)}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classroomId,
              publishImmediately: true,
              status: "PUBLISHED",
              availableAt: availableAt ? availableAt : null,
              deadlineAt: deadlineAt ? deadlineAt : null,
              timeLimit: Number(timeLimit) || null,
            }),
          },
        );

        if (!importRes.ok) {
          const errData = await importRes.json().catch(() => null);
          throw new Error(
            errData?.error ||
              errData?.message ||
              "Não foi possível importar e publicar a prova.",
          );
        }
      }

      toast.success("Prova importada e publicada com sucesso!");
      router.push("/avaliacoes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao aplicar a avaliação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title.toLowerCase().includes(examSearch.toLowerCase()) ||
      a.subject.toLowerCase().includes(examSearch.toLowerCase()),
  );

  return (
    <AppLayout active="atribuirprova">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Aplicar Prova</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f3b63]">Aplicar Prova</h1>
          <p className="mt-1 text-sm text-slate-500">
            Selecione o modelo de prova, configure as regras e escolha as turmas
            para geração e publicação automática.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loadingData ? (
          <div className="flex h-64 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-[#0052cc]" />
            <span className="text-sm font-medium">
              Carregando modelos de avaliação...
            </span>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ETAPA 1 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-sm font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  Selecionar Prova (Catálogo de IA)
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Escolha qual modelo de avaliação será importado para as
                  turmas.
                </p>

                <div className="relative mb-4 max-w-md">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por título ou matéria..."
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0052cc]"
                  />
                </div>

                {filteredAssessments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    Nenhum modelo de prova encontrado.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredAssessments.map((assessment) => {
                      const isSelected = selectedAssessmentId === assessment.id;
                      return (
                        <div
                          key={assessment.id}
                          onClick={() => setSelectedAssessmentId(assessment.id)}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-[#0052cc] bg-blue-50/50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#0052cc]">
                              {assessment.subject} • {assessment.gradeLevel}
                            </span>
                            <input
                              type="radio"
                              name="assessmentSelection"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedAssessmentId(assessment.id)
                              }
                              className="h-4 w-4 text-[#0052cc]"
                            />
                          </div>
                          <h3 className="font-bold text-slate-800 text-sm">
                            {assessment.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {assessment.createdAt}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* ETAPA 2: CONFIGURAÇÃO DE DISPONIBILIDADE */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-sm font-bold text-white">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Configuração
                </h2>

                <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0052cc] flex items-center gap-1.5">
                    <Calendar size={15} /> Disponibilidade
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="datetime-local"
                        value={availableAt}
                        onChange={(e) => setAvailableAt(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-[#0052cc]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Data de Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={deadlineAt}
                        onChange={(e) => setDeadlineAt(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-[#0052cc]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Clock size={14} /> Tempo de Prova (minutos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-[#0052cc]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* ETAPA 3: SELEÇÃO DE TURMAS */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-sm font-bold text-white">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Público Alvo
                    </h2>
                    <p className="text-xs text-slate-500">
                      Minhas Turmas ({selectedClassroomIds.length} selecionadas)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllClassrooms}
                    className="text-xs font-semibold text-[#0052cc] hover:underline"
                  >
                    {selectedClassroomIds.length === classrooms.length
                      ? "Desmarcar todas"
                      : "Selecionar todas"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {classrooms.map((c) => {
                    const isChecked = selectedClassroomIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleClassroom(c.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition flex items-start gap-3 ${
                          isChecked
                            ? "border-[#0052cc] bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClassroom(c.id)}
                          className="mt-1 h-4 w-4 text-[#0052cc]"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {c.name}
                          </h4>
                          <span className="text-xs text-slate-500">
                            Código: {c.code}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BARRA DE AÇÃO */}
            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0052cc]">
                    <Users size={20} />
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Ao confirmar, a prova será importada da IA, alterada para o
                    status <strong className="text-slate-800">PUBLICADA</strong>{" "}
                    e vinculada às turmas selecionadas.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmApplication}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#0052cc] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0043a8] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        <span>Criando e Publicando...</span>
                      </>
                    ) : (
                      <span>Confirmar Aplicação &gt;</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
