"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit3,
  FileText,
  FlaskConical,
  History,
  Languages,
  LoaderCircle,
  Search,
  Sigma,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

export type BffAssessment = {
  id: string;
  originalRequest?: {
    subject?: string;
    gradeLevel?: string;
  };
  currentVersion?: {
    assessment?: {
      title?: string;
    };
  };
  createdAt?: string;
};

export type AssessmentsResponse = {
  data: BffAssessment[];
  meta?: {
    count?: number;
  };
};

export type AssessmentItem = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  createdAt: string;
  createdAtDate: Date | null;
  icon: "science" | "math" | "history" | "portuguese" | "default";
  tagColor: "green" | "blue" | "purple" | "cyan" | "slate";
};

export const tagStyles = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string) {
  const date = parseDate(value);

  if (!date) {
    return "Data não informada";
  }

  return `Criado em ${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

export function getSubjectPresentation(subject: string): {
  icon: AssessmentItem["icon"];
  tagColor: AssessmentItem["tagColor"];
} {
  const normalized = normalizeText(subject);

  if (normalized.includes("ciencia")) {
    return { icon: "science", tagColor: "green" };
  }

  if (normalized.includes("matematica")) {
    return { icon: "math", tagColor: "blue" };
  }

  if (normalized.includes("historia")) {
    return { icon: "history", tagColor: "purple" };
  }

  if (normalized.includes("portugues")) {
    return { icon: "portuguese", tagColor: "cyan" };
  }

  return { icon: "default", tagColor: "slate" };
}

export function toAssessmentItem(assessment: BffAssessment): AssessmentItem {
  const subject = assessment.originalRequest?.subject || "Matéria";
  const presentation = getSubjectPresentation(subject);

  return {
    id: assessment.id,
    title:
      assessment.currentVersion?.assessment?.title || `Avaliação de ${subject}`,
    subject,
    gradeLevel: assessment.originalRequest?.gradeLevel || "Ano não informado",
    createdAt: formatDate(assessment.createdAt),
    createdAtDate: parseDate(assessment.createdAt),
    icon: presentation.icon,
    tagColor: presentation.tagColor,
  };
}

export function AssessmentIcon({ icon }: { icon: AssessmentItem["icon"] }) {
  const className = "h-6 w-6";

  if (icon === "science") {
    return <FlaskConical className={className} />;
  }

  if (icon === "math") {
    return <Sigma className={className} />;
  }

  if (icon === "history") {
    return <History className={className} />;
  }

  if (icon === "portuguese") {
    return <Languages className={className} />;
  }

  return <FileText className={className} />;
}

export default function ProvasPage() {
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAssessments() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/ia/assessments", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const data = (await response.json()) as
          | AssessmentsResponse
          | {
              error?: string;
              message?: string;
            };

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "message" in data
                ? data.message
                : "Não foi possível carregar as provas.",
          );
        }

        if (!active) {
          return;
        }

        const payload = data as AssessmentsResponse;

        if (!Array.isArray(payload.data)) {
          throw new Error("Resposta invalida ao carregar as provas.");
        }

        const items = payload.data.map(toAssessmentItem);

        setAssessments(items);
        setTotalCount(payload.meta?.count ?? items.length);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as provas.",
        );
        setAssessments([]);
        setTotalCount(0);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAssessments();

    return () => {
      active = false;
    };
  }, []);

  const filteredAssessments = useMemo(() => {
    const term = normalizeText(search.trim());

    if (!term) {
      return assessments;
    }

    return assessments.filter((assessment) =>
      normalizeText(
        [assessment.title, assessment.subject, assessment.gradeLevel].join(" "),
      ).includes(term),
    );
  }, [assessments, search]);

  const monthCount = useMemo(() => {
    const now = new Date();

    return assessments.filter(
      (assessment) =>
        assessment.createdAtDate &&
        assessment.createdAtDate.getMonth() === now.getMonth() &&
        assessment.createdAtDate.getFullYear() === now.getFullYear(),
    ).length;
  }, [assessments]);

  return (
    <AppLayout active="provas">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Painel</span>
          <span>&gt;</span>
          <span className="text-[#1e3a8a]">Provas</span>
        </div>

        <header className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0f3b63]">
              Lista de Provas
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Gerencie e visualize todas as provas criadas com o auxílio da IA.
            </p>
          </div>
        </header>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 sm:w-80">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título ou matéria..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                <FileText size={24} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total de Provas
                </small>
                <strong className="block text-2xl text-slate-950">
                  {loading ? "-" : totalCount}
                </strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Sparkles size={24} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Geradas por IA
                </small>
                <strong className="block text-2xl text-slate-950">
                  {loading ? "-" : assessments.length}
                </strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <CalendarDays size={24} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Este Mês
                </small>
                <strong className="block text-2xl text-slate-950">
                  {loading ? "-" : monthCount}
                </strong>
              </div>
            </div>
          </article>
        </section>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
            <LoaderCircle className="mx-auto mb-3 animate-spin text-[#1e3a8a]" />
            Carregando provas...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <article
                key={assessment.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#1e3a8a]">
                  <AssessmentIcon icon={assessment.icon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        tagStyles[assessment.tagColor]
                      }`}
                    >
                      {assessment.subject}
                    </span>
                    <span>• {assessment.gradeLevel}</span>
                  </div>

                  <h2 className="text-lg font-bold leading-snug text-slate-950">
                    {assessment.title}
                  </h2>

                  <span className="mt-2 block text-sm text-slate-500">
                    {assessment.createdAt}
                  </span>
                </div>

                <Link
                  href={`/confeccao/${assessment.id}`}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#1e3a8a] transition hover:border-blue-200 hover:bg-blue-50 sm:self-start"
                >
                  <Edit3 size={16} />
                  Editar
                </Link>
              </article>
            ))}

            {filteredAssessments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Nenhuma prova encontrada para a busca informada.
              </div>
            )}
          </section>
        )}
      </section>
    </AppLayout>
  );
}
