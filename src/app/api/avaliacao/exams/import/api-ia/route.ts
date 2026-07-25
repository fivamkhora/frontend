import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const classroomId = new URL(request.url).searchParams
    .get("classroomId")
    ?.trim();

  if (!classroomId) {
    return jsonError("Identificador da turma invalido.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao listar provas aplicadas no BFF.",
    method: "GET",
    path: `/api/v1/avaliacao/exams/import/api-ia?classroomId=${encodeURIComponent(classroomId)}`,
  });
}
