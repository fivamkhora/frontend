import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type BffUser = {
  email?: unknown;
  id?: unknown;
  name?: unknown;
  role?: unknown;
  user_id?: unknown;
  username?: unknown;
};

type Professor = {
  email: string;
  id: number;
  name: string;
  username: string;
};

function toProfessor(value: unknown): Professor | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as BffUser;
  const id =
    typeof user.user_id === "number"
      ? user.user_id
      : typeof user.id === "number"
        ? user.id
        : null;

  if (
    id === null ||
    typeof user.role !== "string" ||
    user.role.trim().toLowerCase() !== "professor"
  ) {
    return null;
  }

  return {
    email: typeof user.email === "string" ? user.email : "",
    id,
    name:
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : typeof user.username === "string"
          ? user.username
          : `Professor ${id}`,
    username: typeof user.username === "string" ? user.username : "",
  };
}

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  try {
    const response = await fetch(
      `${BFF_BASE_URL}/api/v1/auth/user?role=Professor`,
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
        "Nao foi possivel buscar os professores.",
        response.status,
      );
    }

    const wrappedData =
      data && typeof data === "object"
        ? (data as { data?: unknown })
        : null;
    const users: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(wrappedData?.data)
        ? wrappedData.data
        : [];
    const professors = users
      .map(toProfessor)
      .filter((professor): professor is Professor => professor !== null);

    return Response.json(professors);
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
