import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const body = await request.json().catch(() => null);

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao atualizar resposta.",
    method: "PUT",
    path: `/api/v1/avaliacao/answers/${params.id}`,
    body,
  });
}
