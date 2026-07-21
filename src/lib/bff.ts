import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session";

export const BFF_BASE_URL =
  process.env.BFF_BASE_URL?.replace(/\/$/, "") ??
  "https://bff-khora.onrender.com";

export const IA_ASSESSMENTS_PATH = "/api/v1/ia/assessments";

type BffRequestOptions = {
  authToken?: string;
  body?: unknown;
  errorMessage: string;
  method: "DELETE" | "GET" | "POST";
  path: string;
};

export function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function readJsonPayload(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function clearSessionOnUnauthorized(response: NextResponse, status: number) {
  if (status === 401) {
    response.cookies.set(AUTH_SESSION_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  }

  return response;
}

export function jsonError(error: string, status: number) {
  return clearSessionOnUnauthorized(
    NextResponse.json({ error }, { status }),
    status,
  );
}

export async function proxyBffJson({
  authToken,
  body,
  errorMessage,
  method,
  path,
}: BffRequestOptions) {
  try {
    const response = await fetch(`${BFF_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok) {
      const status = response.status === 404 ? 502 : response.status;

      return clearSessionOnUnauthorized(
        NextResponse.json(
          {
            error: errorMessage,
            upstreamStatus: response.status,
            upstreamPath: path,
            upstreamResponse:
              data ?? responseText ?? "Resposta vazia retornada pelo BFF.",
          },
          { status },
        ),
        status,
      );
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
