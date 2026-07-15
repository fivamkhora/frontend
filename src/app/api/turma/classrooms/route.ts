import { getAuthSession } from "@/lib/auth/server";
import {
  BFF_BASE_URL,
  jsonError,
  parseJsonSafely,
  proxyBffJson,
  readJsonPayload,
} from "@/lib/bff";

export const runtime = "nodejs";

type AuthenticatedUser = {
  id: number;
};

type CreateClassroomPayload = {
  name?: unknown;
  schoolYear?: unknown;
  teacherIds?: unknown;
};

type ValidCreateClassroomPayload = {
  name: string;
  schoolYear: string;
  teacherIds: number[];
};

function isCreateClassroomPayload(
  value: unknown,
): value is ValidCreateClassroomPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as CreateClassroomPayload;

  return (
    typeof payload.name === "string" &&
    payload.name.trim().length > 0 &&
    typeof payload.schoolYear === "string" &&
    /^\d{4}$/.test(payload.schoolYear) &&
    Array.isArray(payload.teacherIds) &&
    payload.teacherIds.length > 0 &&
    payload.teacherIds.every(
      (teacherId) => Number.isInteger(teacherId) && teacherId > 0,
    )
  );
}

async function fetchAuthenticatedUser(authToken: string) {
  const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/whoami`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  const data = parseJsonSafely(responseText);

  if (!response.ok || !data || typeof data !== "object") {
    return null;
  }

  const user = data as Partial<AuthenticatedUser>;

  return typeof user.id === "number" ? user : null;
}

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const user = await fetchAuthenticatedUser(session.token);

  if (!user) {
    return jsonError("Nao foi possivel identificar o usuario autenticado.", 502);
  }

  const response = await fetch(
    `${BFF_BASE_URL}/api/v1/turma/classrooms/${user.id}/members`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    },
  );
  const responseText = await response.text();
  const data = parseJsonSafely(responseText);

  if (!response.ok) {
    return jsonError(
      "Erro ao listar turmas do professor no BFF.",
      response.status,
    );
  }

  return Response.json(Array.isArray(data) ? data : []);
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const payload = await readJsonPayload(request);

  if (!isCreateClassroomPayload(payload)) {
    return jsonError("Dados da turma invalidos.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    body: {
      name: payload.name.trim(),
      schoolYear: payload.schoolYear,
      teacherIds: payload.teacherIds,
    },
    errorMessage: "Erro ao criar turma no BFF.",
    method: "POST",
    path: "/api/v1/turma/classrooms",
  });
}
