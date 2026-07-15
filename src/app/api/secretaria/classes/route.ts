import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type BffClassroom = {
  code?: unknown;
  createdAt?: unknown;
  id?: unknown;
  name?: unknown;
  schoolYear?: unknown;
  teacherId?: unknown;
  updatedAt?: unknown;
};

type Classroom = {
  code: string;
  createdAt: string;
  id: string;
  name: string;
  schoolYear: string;
  teacherId: number | null;
  updatedAt: string;
};

function toClassroom(value: unknown): Classroom | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const classroom = value as BffClassroom;

  if (
    typeof classroom.id !== "string" ||
    typeof classroom.name !== "string"
  ) {
    return null;
  }

  return {
    code: typeof classroom.code === "string" ? classroom.code : "",
    createdAt:
      typeof classroom.createdAt === "string" ? classroom.createdAt : "",
    id: classroom.id,
    name: classroom.name,
    schoolYear:
      typeof classroom.schoolYear === "string" ? classroom.schoolYear : "",
    teacherId:
      typeof classroom.teacherId === "number" ? classroom.teacherId : null,
    updatedAt:
      typeof classroom.updatedAt === "string" ? classroom.updatedAt : "",
  };
}

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Nao autenticado.", 401);
  }

  try {
    const response = await fetch(`${BFF_BASE_URL}/api/v1/turma/classrooms`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });
    const responseText = await response.text();
    const data = parseJsonSafely(responseText);

    if (!response.ok) {
      return jsonError("Nao foi possivel buscar as turmas.", response.status);
    }

    const wrappedData =
      data && typeof data === "object"
        ? (data as { data?: unknown })
        : null;
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(wrappedData?.data)
        ? wrappedData.data
        : [];
    const classrooms = items
      .map(toClassroom)
      .filter((classroom): classroom is Classroom => classroom !== null);

    return Response.json(classrooms);
  } catch {
    return jsonError("Nao foi possivel comunicar com o BFF.", 502);
  }
}
