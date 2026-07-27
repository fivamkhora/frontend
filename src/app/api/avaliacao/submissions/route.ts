import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { search } = new URL(request.url);

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao buscar submissões do aluno.",
    method: "GET",
    path: `/api/v1/avaliacao/submissions${search}`,
  });
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const body = await request.json().catch(() => null);

  if (!body?.examId) {
    return jsonError("ID da avaliação não informado.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao iniciar submissão da prova.",
    method: "POST",
    path: "/api/v1/avaliacao/submissions",
    body,
  });
}
