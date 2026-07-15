export type Professor = {
  email: string;
  id: number;
  name: string;
  username: string;
};

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

export async function fetchProfessors(): Promise<Professor[]> {
  const response = await fetch("/api/secretaria/professores", {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const data = (await response.json()) as Professor[] | ApiErrorResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      errorData.error || "Nao foi possivel carregar os professores.",
    );
  }

  return Array.isArray(data) ? data : [];
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
