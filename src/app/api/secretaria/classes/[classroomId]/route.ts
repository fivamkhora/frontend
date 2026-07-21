import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    classroomId: string;
  }>;
};

type BffClassroom = {
  code?: unknown;
  createdAt?: unknown;
  id?: unknown;
  name?: unknown;
  schoolYear?: unknown;
  teacherId?: unknown;
  updatedAt?: unknown;
};

type BffClassroomMember = {
  role?: unknown;
  userId?: unknown;
};

function getClassroom(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const wrappedValue = value as { data?: unknown };
  const classroom =
    wrappedValue.data && typeof wrappedValue.data === "object"
      ? (wrappedValue.data as BffClassroom)
      : (value as BffClassroom);

  return typeof classroom.id === "string" ? classroom : null;
}

function getMembers(value: unknown) {
  const wrappedValue =
    value && typeof value === "object"
      ? (value as { data?: unknown })
      : null;
  const members = Array.isArray(value)
    ? value
    : Array.isArray(wrappedValue?.data)
      ? wrappedValue.data
      : [];

  return members
    .filter((member) => member && typeof member === "object")
    .map((member) => member as BffClassroomMember)
    .filter(
      (member) =>
        typeof member.userId === "number" &&
        typeof member.role === "string",
    )
    .map((member) => ({
      role: member.role as string,
      userId: member.userId as number,
    }));
}

async function fetchBffJson(path: string, token: string) {
  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
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

function getUpstreamErrorStatus(
  classroomResponse: { ok: boolean; status: number },
  membersResponse: { ok: boolean; status: number },
) {
  if (!classroomResponse.ok) {
    return classroomResponse.status;
  }

  return membersResponse.status;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  const { classroomId: rawClassroomId } = await context.params;
  const classroomId = rawClassroomId.trim();

  if (!classroomId) {
    return jsonError("Turma nao informada.", 400);
  }

  try {
    const classroomPath = `/api/v1/turma/classrooms/${encodeURIComponent(classroomId)}`;
    const [classroomResponse, membersResponse] = await Promise.all([
      fetchBffJson(classroomPath, session.token),
      fetchBffJson(`${classroomPath}/classrooms`, session.token),
    ]);
    const classroom = getClassroom(classroomResponse.data);

    if (!classroomResponse.ok || !membersResponse.ok) {
      return jsonError(
        "Nao foi possivel carregar a turma e seus membros.",
        getUpstreamErrorStatus(classroomResponse, membersResponse),
      );
    }

    if (!classroom || classroom.id !== classroomId) {
      return jsonError("Resposta invalida ao carregar a turma.", 502);
    }

    return Response.json({
      classroom: {
        code: typeof classroom.code === "string" ? classroom.code : "",
        createdAt:
          typeof classroom.createdAt === "string" ? classroom.createdAt : "",
        id: classroom.id,
        name: typeof classroom.name === "string" ? classroom.name : "",
        schoolYear:
          typeof classroom.schoolYear === "string"
            ? classroom.schoolYear
            : "",
        teacherId:
          typeof classroom.teacherId === "number" ? classroom.teacherId : null,
        updatedAt:
          typeof classroom.updatedAt === "string" ? classroom.updatedAt : "",
      },
      members: getMembers(membersResponse.data),
    });
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
