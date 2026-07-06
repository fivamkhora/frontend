export type ClassroomMemberPerson = {
  createdAt: string;
  email: string;
  memberId: string;
  name: string;
  role: string;
  userId: number;
  username: string;
};

export type ClassroomDetails = {
  classroomId: string;
  students: ClassroomMemberPerson[];
  teachers: ClassroomMemberPerson[];
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

export async function getClassroomDetails(classroomId: string) {
  const response = await fetch(
    `/api/classrooms/${encodeURIComponent(classroomId)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );
  const data = await readJson<ClassroomDetails | ApiErrorResponse>(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      errorData.message ||
        errorData.error ||
        "Nao foi possivel carregar os detalhes da turma.",
    );
  }

  return data as ClassroomDetails;
}
