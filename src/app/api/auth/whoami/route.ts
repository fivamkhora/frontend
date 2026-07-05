import { getAuthSession } from "@/lib/auth/server";
import { jsonError, proxyBffJson } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  return proxyBffJson({
    authToken: session.token,
    errorMessage: "Erro ao buscar usuario autenticado no BFF.",
    method: "GET",
    path: "/api/v1/auth/user/whoami",
  });
}
