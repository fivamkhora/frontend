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
    errorMessage: "Erro ao buscar próximas avaliações.",
    method: "GET",
    path: `/api/v1/avaliacao/exams/upcoming${search}`,
  });
}
