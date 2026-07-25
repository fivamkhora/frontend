"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FilePlus2, LoaderCircle } from "lucide-react";
import {
  normalizeText,
  ProvasPageContent,
  type AssessmentItem,
} from "@/app/provas/page";
import { redirectToLoginOnUnauthorized } from "@/services/authService";

type Feedback = {
  kind: "error" | "success";
  message: string;
};

type AppliedExam = {
  apiIaAssessmentId?: unknown;
  assessmentId?: unknown;
  sourceAssessmentId?: unknown;
  title?: unknown;
};

function getAppliedAssessmentId(exam: AppliedExam) {
  const id =
    exam.assessmentId ?? exam.apiIaAssessmentId ?? exam.sourceAssessmentId;

  return typeof id === "string" ? id : null;
}

export default function AtribuirProvaTurmaPage() {
  const { Id: classroomId } = useParams<{ Id: string }>();
  const [assigningAssessmentId, setAssigningAssessmentId] = useState("");
  const [assignedAssessmentIds, setAssignedAssessmentIds] = useState<string[]>(
    [],
  );
  const [appliedAssessmentTitles, setAppliedAssessmentTitles] = useState<
    string[]
  >([]);
  const [loadingAppliedExams, setLoadingAppliedExams] = useState(true);
  const [appliedExamsError, setAppliedExamsError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAppliedExams() {
      setLoadingAppliedExams(true);
      setAppliedExamsError("");

      try {
        const response = await fetch(
          `/api/avaliacao/exams/import/api-ia?classroomId=${encodeURIComponent(classroomId)}`,
          { headers: { Accept: "application/json" } },
        );
        redirectToLoginOnUnauthorized(response);
        const data = (await response.json().catch(() => null)) as
          | AppliedExam[]
          | { error?: string; message?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            !Array.isArray(data) && data
              ? data.message ||
                  data.error ||
                  "Nao foi possivel verificar as provas aplicadas."
              : "Nao foi possivel verificar as provas aplicadas.",
          );
        }

        if (!active) {
          return;
        }

        const exams = Array.isArray(data) ? data : [];

        setAssignedAssessmentIds(
          exams
            .map(getAppliedAssessmentId)
            .filter((id): id is string => Boolean(id)),
        );
        setAppliedAssessmentTitles(
          exams
            .map((exam) =>
              typeof exam.title === "string" ? normalizeText(exam.title) : null,
            )
            .filter((title): title is string => Boolean(title)),
        );
      } catch (error) {
        if (active) {
          setAppliedExamsError(
            error instanceof Error
              ? error.message
              : "Nao foi possivel verificar as provas aplicadas.",
          );
        }
      } finally {
        if (active) {
          setLoadingAppliedExams(false);
        }
      }
    }

    if (classroomId) {
      loadAppliedExams();
    }

    return () => {
      active = false;
    };
  }, [classroomId]);

  async function assignAssessment(assessment: AssessmentItem) {
    if (assigningAssessmentId || assignedAssessmentIds.includes(assessment.id)) {
      return;
    }

    setAssigningAssessmentId(assessment.id);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/avaliacao/exams/import/api-ia/${encodeURIComponent(assessment.id)}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classroomId }),
        },
      );
      redirectToLoginOnUnauthorized(response);
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Nao foi possivel criar a prova da turma.",
        );
      }

      setAssignedAssessmentIds((current) => [...current, assessment.id]);
      setAppliedAssessmentTitles((current) => [
        ...current,
        normalizeText(assessment.title),
      ]);
      setFeedback({
        kind: "success",
        message: `A prova "${assessment.title}" foi criada para a turma.`,
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel criar a prova da turma.",
      });
    } finally {
      setAssigningAssessmentId("");
    }
  }

  return (
    <>
      {feedback && (
        <div
          className={`fixed right-4 top-20 z-50 max-w-sm rounded-lg border p-4 text-sm font-medium shadow-lg ${
            feedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {feedback.message}
        </div>
      )}

      {appliedExamsError && (
        <div
          className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-lg"
          role="alert"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          {appliedExamsError} A selecao foi bloqueada para evitar duplicidade.
        </div>
      )}

      <ProvasPageContent
        active="atribuirprova"
        breadcrumbLabel="Atribuir Provas"
        description={`Selecione entre as provas criadas para atribuir à turma ${classroomId}.`}
        renderAction={(assessment) => {
          const isAssigning = assigningAssessmentId === assessment.id;
          const isAssigned =
            assignedAssessmentIds.includes(assessment.id) ||
            appliedAssessmentTitles.includes(normalizeText(assessment.title));

          return (
            <button
              type="button"
              onClick={() => assignAssessment(assessment)}
              disabled={
                loadingAppliedExams ||
                Boolean(appliedExamsError) ||
                Boolean(assigningAssessmentId) ||
                isAssigned
              }
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition sm:self-start ${
                isAssigned
                  ? "cursor-not-allowed bg-emerald-50 text-emerald-700"
                  : "bg-[#0f3b63] text-white hover:bg-[#164f7c] disabled:cursor-wait disabled:opacity-60"
              }`}
            >
              {loadingAppliedExams ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : isAssigning ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : isAssigned ? (
                <CheckCircle2 size={16} />
              ) : (
                <FilePlus2 size={16} />
              )}
              {loadingAppliedExams
                ? "Verificando..."
                : isAssigning
                ? "Criando..."
                : isAssigned
                  ? "Prova aplicada"
                  : "Selecionar prova"}
            </button>
          );
        }}
        showEditAction={false}
        title="Selecionar Prova"
      />
    </>
  );
}
