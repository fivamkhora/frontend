import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { id } = await params;

  if (!id) {
    return jsonError("ID da avaliação não informado.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao excluir avaliação no BFF.",
    method: "DELETE",
    path: `/api/v1/avaliacao/exams/${encodeURIComponent(id)}`,
  });
}

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { id } = await params;

  if (!id) {
    return jsonError("ID da avaliação não informado.", 400);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao buscar detalhes da avaliação.",
    method: "GET",
    path: `/api/v1/avaliacao/exams/${encodeURIComponent(id)}`,
  });
}
