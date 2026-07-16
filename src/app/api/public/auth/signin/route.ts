import { NextResponse } from "next/server";
import {
  BFF_BASE_URL,
  jsonError,
  parseJsonSafely,
  readJsonPayload,
} from "@/lib/bff";
import {
  AUTH_SESSION_COOKIE,
  createSessionCookie,
  getSessionMaxAgeSeconds,
} from "@/lib/auth/session";

export const runtime = "nodejs";

type SignInPayload = {
  password: string;
  username: string;
};

type BffSignInResponse = {
  role: string;
  token: string;
};

function isSignInPayload(payload: unknown): payload is SignInPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return typeof data.username === "string" && typeof data.password === "string";
}

function isBffSignInResponse(payload: unknown): payload is BffSignInResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return typeof data.token === "string" && typeof data.role === "string";
}

function normalizeCredentials(payload: SignInPayload) {
  return {
    password: payload.password.trim(),
    username: payload.username.trim(),
  };
}

function hasValidCredentialsShape(payload: SignInPayload) {
  const { password, username } = normalizeCredentials(payload);

  return (
    username.length >= 3 &&
    username.length <= 120 &&
    password.length >= 6 &&
    password.length <= 256
  );
}

export async function POST(request: Request) {
  const payload = await readJsonPayload(request);

  if (!isSignInPayload(payload) || !hasValidCredentialsShape(payload)) {
    return jsonError("Usuario ou senha invalidos.", 400);
  }

  const credentials = normalizeCredentials(payload);

  try {
    const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user/signin`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok || !isBffSignInResponse(data)) {
      return jsonError("Usuario ou senha invalidos.", 401);
    }

    const sessionCookie = await createSessionCookie({
      role: data.role,
      token: data.token,
    });
    const sessionMaxAge = getSessionMaxAgeSeconds(data.token);
    const result = NextResponse.json({ role: data.role }, { status: 200 });

    result.cookies.set(AUTH_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      maxAge: sessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return result;
  } catch {
    return jsonError("Usuario ou senha invalidos.", 401);
  }
}
