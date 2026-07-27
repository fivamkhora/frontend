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
  const payload = await readJsonPayload(request).catch(() => null);

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
  const importData = parseJsonSafely(importDataText) as any;
  const examObject = importData?.exam || importData;

  if (!importResponse.ok || !examObject?.id) {
    return Response.json(
      importData || { error: "Erro ao importar a prova na API de Avaliação." },
      { status: importResponse.status || 500 },
    );
  }

  const examId = examObject.id;

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
          availableAt: payload?.availableAt
            ? new Date(payload.availableAt).toISOString()
            : null,
          deadlineAt: payload?.deadlineAt
            ? new Date(payload.deadlineAt).toISOString()
            : null,
          timeLimit: Number(payload?.timeLimit) || null,
        }),
      });
    } catch (err) {
      console.warn(`⚠️ [BFF] Erro ao publicar o exame ${examId}:`, err);
    }
  }

  return Response.json(examObject, { status: 201 });
}
