import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId")?.trim();

  if (!examId) {
    return jsonError("ID da avaliação não informado.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao buscar questões da avaliação.",
    method: "GET",
    path: `/api/v1/avaliacao/questions?examId=${encodeURIComponent(examId)}`,
  });
}
