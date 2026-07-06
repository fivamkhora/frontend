import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type ClassroomMember = {
  classroomId: string;
  createdAt: string;
  id: string;
  role: string;
  userId: number;
};

type BffUser = {
  email?: string;
  id?: number;
  name?: string;
  role?: string;
  user_id?: number;
  username?: string;
};

type ClassroomMemberDetails = {
  createdAt: string;
  email: string;
  memberId: string;
  name: string;
  role: string;
  userId: number;
  username: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isClassroomMember(value: unknown): value is ClassroomMember {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.classroomId === "string" &&
    typeof data.createdAt === "string" &&
    typeof data.id === "string" &&
    typeof data.role === "string" &&
    typeof data.userId === "number"
  );
}

function getUserId(user: BffUser) {
  return typeof user.user_id === "number" ? user.user_id : user.id;
}

function toMemberDetails(
  member: ClassroomMember,
  userById: Map<number, BffUser>,
): ClassroomMemberDetails {
  const user = userById.get(member.userId);

  return {
    createdAt: member.createdAt,
    email: user?.email || "",
    memberId: member.id,
    name: user?.name || user?.username || `Usuario ${member.userId}`,
    role: user?.role || member.role,
    userId: member.userId,
    username: user?.username || "",
  };
}

function splitMembers(
  members: ClassroomMember[],
  users: BffUser[],
  classroomId: string,
) {
  const userById = new Map<number, BffUser>();

  for (const user of users) {
    const userId = getUserId(user);

    if (typeof userId === "number") {
      userById.set(userId, user);
    }
  }

  const details = members.map((member) => toMemberDetails(member, userById));

  return {
    classroomId,
    students: details.filter((member) =>
      member.role.toLowerCase().includes("aluno"),
    ),
    teachers: details.filter((member) =>
      member.role.toLowerCase().includes("professor"),
    ),
  };
}

async function fetchBffJson(path: string, token?: string) {
  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  const responseText = await response.text();

  return {
    data: parseJsonSafely(responseText),
    ok: response.ok,
    status: response.status,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const { id } = await context.params;
  const classroomId = id.trim();

  if (!classroomId) {
    return jsonError("Turma nao informada.", 400);
  }

  try {
    const membersResponse = await fetchBffJson(
      `/api/v1/turma/classrooms/${encodeURIComponent(classroomId)}`,
      session.token,
    );

    if (!membersResponse.ok) {
      return jsonError(
        "Erro ao buscar membros da turma no BFF.",
        membersResponse.status,
      );
    }

    const members = Array.isArray(membersResponse.data)
      ? membersResponse.data.filter(isClassroomMember)
      : [];

    if (members.length === 0) {
      return Response.json({
        classroomId,
        students: [],
        teachers: [],
      });
    }

    const userIds = Array.from(
      new Set(members.map((member) => member.userId)),
    ).filter((userId) => Number.isFinite(userId));
    const usersResponse = await fetchBffJson(
      `/api/v1/auth/users?ids=${encodeURIComponent(userIds.join(","))}`,
      session.token,
    );

    if (!usersResponse.ok) {
      return jsonError(
        "Erro ao buscar usuarios da turma no BFF.",
        usersResponse.status,
      );
    }

    const users = Array.isArray(usersResponse.data)
      ? (usersResponse.data as BffUser[])
      : [];

    return Response.json(splitMembers(members, users, classroomId));
  } catch {
    return jsonError("Nao foi possivel carregar os detalhes da turma.", 502);
  }
}
