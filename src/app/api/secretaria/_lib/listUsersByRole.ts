import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

type BffUser = {
  email?: unknown;
  id?: unknown;
  name?: unknown;
  role?: unknown;
  user_id?: unknown;
  username?: unknown;
};

type DirectoryUser = {
  email: string;
  id: number;
  name: string;
  username: string;
};

type UserRole = "Aluno" | "Professor";

function toDirectoryUser(
  value: unknown,
  expectedRole: UserRole,
): DirectoryUser | null {
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
    user.role.trim().toLowerCase() !== expectedRole.toLowerCase()
  ) {
    return null;
  }

  return {
    email: typeof user.email === "string" ? user.email : "",
    id,
    name:
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : typeof user.username === "string" && user.username.trim()
          ? user.username.trim()
          : `${expectedRole} ${id}`,
    username: typeof user.username === "string" ? user.username : "",
  };
}

export async function listUsersByRole(role: UserRole) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  try {
    const response = await fetch(
      `${BFF_BASE_URL}/api/v1/auth/user?role=${encodeURIComponent(role)}`,
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
        `Nao foi possivel buscar usuarios com perfil ${role}.`,
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
    const directoryUsers = users
      .map((user) => toDirectoryUser(user, role))
      .filter((user): user is DirectoryUser => user !== null);

    return Response.json(directoryUsers);
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
