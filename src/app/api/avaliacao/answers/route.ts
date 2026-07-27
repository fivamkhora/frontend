import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const body = await request.json().catch(() => null);

  if (!body?.submissionId || !body?.questionId) {
    return jsonError(
      "Dados incompletos (submissionId ou questionId ausentes).",
      400,
    );
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao registrar resposta.",
    method: "POST",
    path: "/api/v1/avaliacao/answers",
    body,
  });
}
