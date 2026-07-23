"use client";

import {
  AssessmentIcon,
  AssessmentItem,
  AssessmentsResponse,
  normalizeText,
  toAssessmentItem,
} from "@/app/provas/page";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function Provas() {
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
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

        if (!active) return;

        const payload = data as AssessmentsResponse;

        if (!Array.isArray(payload.data)) {
          throw new Error("Resposta inválida ao carregar as provas.");
        }

        const items = payload.data.map(toAssessmentItem);

        setAssessments(items);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as provas.",
        );

        setAssessments([]);
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

    const items = term
      ? assessments.filter((assessment) =>
          normalizeText(
            [assessment.title, assessment.subject, assessment.gradeLevel].join(
              " ",
            ),
          ).includes(term),
        )
      : assessments;

    return items
      .slice()
      .sort((a, b) => {
        const getTime = (dateVal: string | Date | null | undefined) => {
          if (!dateVal) return 0;
          return new Date(dateVal).getTime();
        };

        return getTime(b.createdAtDate) - getTime(a.createdAtDate);
      })
      .slice(0, 4);
  }, [assessments, search]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
        Carregando avaliações...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Avaliações Recentes
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Últimas avaliações geradas pela IA.
        </p>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-6 py-4">Avaliação</th>
            <th className="px-6 py-4">Disciplina</th>
            <th className="px-6 py-4">Criada em</th>
          </tr>
        </thead>

        <tbody>
          {filteredAssessments.map((assessment) => (
            <tr
              key={assessment.id}
              className="border-t border-slate-100 transition hover:bg-slate-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <AssessmentIcon icon={assessment.icon} />
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">
                      {assessment.title}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-slate-700">
                {assessment.subject}
              </td>

              <td className="px-6 py-4 text-sm text-slate-700">
                {assessment.createdAt}
              </td>
            </tr>
          ))}

          {filteredAssessments.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-8 text-center text-sm text-slate-500"
              >
                Nenhuma avaliação encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-slate-100 p-4 text-center">
        <Link
          href="/provas"
          className="inline-flex items-center justify-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Ver Todas as Provas
        </Link>
      </div>
    </div>
  );
}
