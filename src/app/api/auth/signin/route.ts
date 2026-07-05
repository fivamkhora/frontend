import {
  jsonError,
  proxyBffJson,
  readJsonPayload,
} from "../../_lib/bff";

export const runtime = "nodejs";

type SignInPayload = {
  password: string;
  username: string;
};

function isSignInPayload(payload: unknown): payload is SignInPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return typeof data.username === "string" && typeof data.password === "string";
}

export async function POST(request: Request) {
  const payload = await readJsonPayload(request);

  if (!isSignInPayload(payload)) {
    return jsonError("Informe usuario e senha para autenticar.", 400);
  }

  if (!payload.username.trim() || !payload.password.trim()) {
    return jsonError("Informe usuario e senha para autenticar.", 400);
  }

  return proxyBffJson({
    body: {
      username: payload.username,
      password: payload.password,
    },
    errorMessage: "Erro ao autenticar usuario no BFF.",
    method: "POST",
    path: "/api/v1/auth/user/signin",
  });
}
