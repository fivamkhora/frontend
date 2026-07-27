import { getAuthSession } from "@/lib/auth/server";
import {
  BFF_BASE_URL,
  jsonError,
  parseJsonSafely,
  readJsonPayload,
} from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ assessmentId: string }>;
};

type ImportExamPayload = {
  availableAt?: unknown;
  classroomId?: unknown;
  deadlineAt?: unknown;
  publishImmediately?: unknown;
  status?: unknown;
  timeLimit?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toOptionalIsoDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function getAuthenticatedUserId(authToken: string) {
  try {
    const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/whoami`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });
    const responseText = await response.text();
    const data = parseJsonSafely(responseText) as { id?: unknown } | null;

    if (!response.ok || !data?.id) {
      return null;
    }

    return String(data.id);
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { assessmentId } = await params;
  const payload = (await readJsonPayload(request).catch(
    () => null,
  )) as ImportExamPayload | null;

  const classroomId = payload?.classroomId;

  if (
    !assessmentId?.trim() ||
    typeof classroomId !== "string" ||
    !classroomId.trim()
  ) {
    return jsonError("Identificador da turma ou da prova ausente.", 400);
  }

  const authUserId = await getAuthenticatedUserId(session.token);

  if (!authUserId) {
    return jsonError(
      "Não foi possível identificar o professor autenticado.",
      502,
    );
  }

  const importResponse = await fetch(
    `${BFF_BASE_URL}/api/v1/avaliacao/exams/import/api-ia/${encodeURIComponent(assessmentId)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        classroomId: classroomId.trim(),
        teacherId: String(authUserId).trim(),
      }),
    },
  );

  const importDataText = await importResponse.text();
  const parsedImportData = parseJsonSafely(importDataText) as unknown;
  const importData = isRecord(parsedImportData) ? parsedImportData : null;
  const nestedExam = importData?.exam;
  const examObject = isRecord(nestedExam) ? nestedExam : importData;

  if (
    !importResponse.ok ||
    !examObject ||
    (typeof examObject.id !== "string" && typeof examObject.id !== "number")
  ) {
    return Response.json(
      importData || { error: "Erro ao importar a prova na API de Avaliação." },
      { status: importResponse.status || 500 },
    );
  }

  const examId = String(examObject.id);

  if (payload?.status === "PUBLISHED" || payload?.publishImmediately) {
    try {
      await fetch(`${BFF_BASE_URL}/api/v1/avaliacao/exams/${examId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          status: "PUBLISHED",
          availableAt: toOptionalIsoDate(payload?.availableAt),
          deadlineAt: toOptionalIsoDate(payload?.deadlineAt),
          timeLimit: Number(payload?.timeLimit) || null,
        }),
      });
    } catch (err) {
      console.warn(`⚠️ [BFF] Erro ao publicar o exame ${examId}:`, err);
    }
  }

  return Response.json(examObject, { status: 201 });
}
