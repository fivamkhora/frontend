import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  try {
    const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    const text = await response.text();
    const data = parseJsonSafely(text);

    if (!response.ok) {
      return jsonError("Erro ao listar usuários no BFF.", response.status);
    }

    return Response.json(Array.isArray(data) ? data : []);
  } catch (error) {
    return jsonError("Erro interno ao buscar usuários.", 500);
  }
}
