import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { id } = await params;

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao buscar submissão.",
    method: "GET",
    path: `/api/v1/avaliacao/submissions/${encodeURIComponent(id)}`,
  });
}

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
    errorMessage: "Erro ao atualizar submissão.",
    method: "PUT",
    path: `/api/v1/avaliacao/submissions/${encodeURIComponent(id)}`,
    body,
  });
}
