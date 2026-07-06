import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type AuthenticatedUser = {
  id: number;
};

async function fetchAuthenticatedUser(authToken: string) {
  const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/whoami`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  const data = parseJsonSafely(responseText);

  if (!response.ok || !data || typeof data !== "object") {
    return null;
  }

  const user = data as Partial<AuthenticatedUser>;

  return typeof user.id === "number" ? user : null;
}

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const user = await fetchAuthenticatedUser(session.token);

  if (!user) {
    return jsonError("Nao foi possivel identificar o usuario autenticado.", 502);
  }

  const response = await fetch(
    `${BFF_BASE_URL}/api/v1/turma/classrooms/${user.id}/members`,
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
    return jsonError(
      "Erro ao listar turmas do professor no BFF.",
      response.status,
    );
  }

  return Response.json(Array.isArray(data) ? data : []);
}
