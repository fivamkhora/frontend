export type DirectoryUser = {
  email: string;
  id: number;
  name: string;
  username: string;
};

export type Professor = DirectoryUser;
export type Student = DirectoryUser;

export type SecretariaClassroom = {
  code: string;
  createdAt: string;
  id: string;
  name: string;
  schoolYear: string;
  teacherId: number | null;
  updatedAt: string;
};

type ApiErrorResponse = {
  error?: string;
};

async function fetchDirectoryUsers(
  path: string,
  fallbackMessage: string,
): Promise<DirectoryUser[]> {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const data = (await response.json()) as DirectoryUser[] | ApiErrorResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(errorData.error || fallbackMessage);
  }

  return Array.isArray(data) ? data : [];
}

export async function fetchProfessors(): Promise<Professor[]> {
  return fetchDirectoryUsers(
    "/api/secretaria/professores",
    "Nao foi possivel carregar os professores.",
  );
}

export async function fetchStudents(): Promise<Student[]> {
  return fetchDirectoryUsers(
    "/api/secretaria/alunos",
    "Nao foi possivel carregar os alunos.",
  );
}

export async function fetchSecretariaClassrooms(): Promise<
  SecretariaClassroom[]
> {
  const response = await fetch("/api/secretaria/classes", {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const data = (await response.json()) as
    | SecretariaClassroom[]
    | ApiErrorResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      errorData.error || "Nao foi possivel carregar as turmas.",
    );
  }

  return Array.isArray(data) ? data : [];
}

async function updateClassroomMember(
  classroomId: string,
  userId: number,
  method: "DELETE" | "POST",
  resource: "students" | "teachers",
) {
  const response = await fetch(
    `/api/secretaria/classes/${encodeURIComponent(classroomId)}/${resource}`,
    {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse;

    throw new Error(
      data.error ||
        `Nao foi possivel ${method === "POST" ? "adicionar" : "remover"} o usuario.`,
    );
  }
}

export async function addClassroomTeacher(
  classroomId: string,
  userId: number,
) {
  return updateClassroomMember(classroomId, userId, "POST", "teachers");
}

export async function removeClassroomTeacher(
  classroomId: string,
  userId: number,
) {
  return updateClassroomMember(classroomId, userId, "DELETE", "teachers");
}

export async function addClassroomStudent(
  classroomId: string,
  userId: number,
) {
  return updateClassroomMember(classroomId, userId, "POST", "students");
}

export async function removeClassroomStudent(
  classroomId: string,
  userId: number,
) {
  return updateClassroomMember(classroomId, userId, "DELETE", "students");
}
