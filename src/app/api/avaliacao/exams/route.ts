import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get("classroomId")?.trim();

  const queryPath = classroomId
    ? `/api/v1/avaliacao/exams?classroomId=${encodeURIComponent(classroomId)}`
    : `/api/v1/avaliacao/exams`;

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao listar avaliações no BFF.",
    method: "GET",
    path: queryPath,
  });
}
