import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type AuthenticatedUser = {
  id: number;
  role?: string;
  user?: { role?: string };
  person?: { role?: string };
};

async function fetchAuthenticatedUser(authToken: string) {
  try {
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

    return data as Partial<AuthenticatedUser>;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { searchParams } = new URL(request.url);
  const isAllParam = searchParams.get("all") === "true";

  const user = await fetchAuthenticatedUser(session.token);

  if (!user || !user.id) {
    return jsonError(
      "Não foi possível identificar o usuário autenticado.",
      502,
    );
  }

  const userRole = String(
    user.role || user.person?.role || user.user?.role || "",
  ).toLowerCase();

  const isAdminOrSecretaria =
    isAllParam ||
    userRole === "administrador" ||
    userRole === "admin" ||
    userRole === "secretaria";

  const endpointPath = isAdminOrSecretaria
    ? `${BFF_BASE_URL}/api/v1/turma/classrooms`
    : `${BFF_BASE_URL}/api/v1/turma/classrooms/${user.id}/members`;

  try {
    const response = await fetch(endpointPath, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok) {
      return jsonError("Erro ao listar turmas no BFF.", response.status);
    }

    let classroomsList: any[] = [];

    if (Array.isArray(data)) {
      classroomsList = data;
    } else if (Array.isArray(data?.data)) {
      classroomsList = data.data;
    } else if (Array.isArray(data?.classrooms)) {
      classroomsList = data.classrooms;
    }

    return Response.json(classroomsList);
  } catch (error) {
    return jsonError("Erro interno ao buscar turmas no BFF.", 500);
  }
}
