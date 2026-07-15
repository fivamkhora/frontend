import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson, readJsonPayload } from "@/lib/bff";

export type ClassroomMemberRouteContext = {
  params: Promise<{
    classroomId: string;
  }>;
};

type MemberPayload = {
  userId?: unknown;
};

type MemberResource = "students" | "teachers";

function getUserId(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as MemberPayload;

  return typeof payload.userId === "number" &&
    Number.isInteger(payload.userId) &&
    payload.userId > 0
    ? payload.userId
    : null;
}

export async function updateClassroomMember(
  request: Request,
  context: ClassroomMemberRouteContext,
  method: "DELETE" | "POST",
  resource: MemberResource,
) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const { classroomId: rawClassroomId } = await context.params;
  const classroomId = rawClassroomId.trim();
  const userId = getUserId(await readJsonPayload(request));

  if (!classroomId || userId === null) {
    return jsonError("Dados do vinculo invalidos.", 400);
  }

  const memberLabel = resource === "teachers" ? "professor" : "aluno";

  return proxyBffJson({
    authToken: session.token,
    body: { userId },
    errorMessage:
      method === "POST"
        ? `Erro ao adicionar ${memberLabel} na turma.`
        : `Erro ao remover ${memberLabel} da turma.`,
    method,
    path: `/api/v1/turma/classrooms/${encodeURIComponent(classroomId)}/${resource}`,
  });
}
