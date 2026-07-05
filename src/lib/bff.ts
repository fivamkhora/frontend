import { NextResponse } from "next/server";

export const BFF_BASE_URL =
  process.env.BFF_BASE_URL?.replace(/\/$/, "") ??
  "https://bff-khora.onrender.com";

export const IA_ASSESSMENTS_PATH = "/api/v1/ia/assessments";

type BffRequestOptions = {
  authToken?: string;
  body?: unknown;
  errorMessage: string;
  method: "GET" | "POST";
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

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
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
      return NextResponse.json(
        {
          error: errorMessage,
          upstreamStatus: response.status,
          upstreamPath: path,
          upstreamResponse:
            data ?? responseText ?? "Resposta vazia retornada pelo BFF.",
        },
        { status: response.status === 404 ? 502 : response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
