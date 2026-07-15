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
  members?: unknown;
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

function getMembers(classroom: BffClassroom) {
  const members = Array.isArray(classroom.members)
    ? classroom.members
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
        }))
    : [];

  if (
    typeof classroom.teacherId === "number" &&
    !members.some(
      (member) =>
        member.userId === classroom.teacherId &&
        member.role.toLowerCase() === "professor",
    )
  ) {
    members.push({ role: "Professor", userId: classroom.teacherId });
  }

  return members;
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
    const response = await fetch(
      `${BFF_BASE_URL}/api/v1/turma/classrooms/${encodeURIComponent(classroomId)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        cache: "no-store",
      },
    );
    const responseText = await response.text();
    const classroom = getClassroom(parseJsonSafely(responseText));

    if (!response.ok) {
      return jsonError("Nao foi possivel carregar a turma.", response.status);
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
      members: getMembers(classroom),
    });
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
