import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  { params }: RouteContext,
) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao atualizar resposta.",
    method: "PUT",
    path: `/api/v1/avaliacao/answers/${encodeURIComponent(id)}`,
    body,
  });
}
