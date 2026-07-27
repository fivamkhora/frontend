import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  try {
    const userRes = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/whoami`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    const userData = parseJsonSafely(await userRes.text());
    const studentId = userData?.id;

    if (!studentId) {
      return jsonError("Usuário não encontrado.", 404);
    }

    const response = await fetch(
      `${BFF_BASE_URL}/api/v1/avaliacao/submissions?studentId=${studentId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        cache: "no-store",
      },
    );

    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok) {
      return jsonError("Erro ao buscar notas do aluno.", response.status);
    }

    return Response.json(Array.isArray(data) ? data : []);
  } catch {
    return jsonError("Erro interno ao buscar notas.", 500);
  }
}
