import { getAuthSession } from "@/lib/auth/server";
import {
  BFF_BASE_URL,
  jsonError,
  parseJsonSafely,
  proxyBffJson,
  readJsonPayload,
} from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ assessmentId: string }>;
};

type AssignmentPayload = {
  classroomId?: unknown;
};

type AuthenticatedUser = {
  id?: unknown;
};

async function getAuthenticatedUserId(authToken: string) {
  const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/whoami`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  const data = parseJsonSafely(responseText) as AuthenticatedUser | null;

  if (!response.ok || !data) {
    return null;
  }

  if (
    (typeof data.id !== "number" && typeof data.id !== "string") ||
    String(data.id).trim().length === 0
  ) {
    return null;
  }

  return String(data.id);
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const { assessmentId } = await params;
  const payload = (await readJsonPayload(request)) as AssignmentPayload | null;

  if (
    !assessmentId.trim() ||
    !payload ||
    typeof payload.classroomId !== "string" ||
    !payload.classroomId.trim()
  ) {
    return jsonError("Dados para atribuicao da prova invalidos.", 400);
  }

  const teacherId = await getAuthenticatedUserId(session.token);

  if (!teacherId) {
    return jsonError("Nao foi possivel identificar o professor autenticado.", 502);
  }

  return proxyBffJson({
    authToken: session.token,
    body: {
      classroomId: payload.classroomId.trim(),
      teacherId,
    },
    errorMessage: "Erro ao criar a prova da turma no BFF.",
    method: "POST",
    path: `/api/v1/avaliacao/exams/import/api-ia/${encodeURIComponent(assessmentId)}`,
  });
}
