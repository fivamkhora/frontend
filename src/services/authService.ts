export type LoginResponse = {
  role: string;
};

export type AuthenticatedUser = {
  email: string;
  id: number;
  name: string;
  role: string;
  username: string;
};

export type Classroom = {
  code: string;
  createdAt: string;
  id: string;
  name: string;
  schoolYear: string;
  teacherId: number;
  updatedAt: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

type CreateUser = {
  username: string;
  password: string;
  role: string;
  name: string;
  email: string;
  cpf: string;
  birth: string;
};

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

function getErrorMessage(data: ApiErrorResponse, fallback: string) {
  return data.message || data.error || fallback;
}

export function redirectToLoginOnUnauthorized(response: Pick<Response, "status">) {
  if (response.status !== 401 || typeof window === "undefined") {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

  window.location.replace(loginUrl);
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch("/api/public/auth/signin", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await readJson<LoginResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      getErrorMessage(errorData, "Nao foi possivel autenticar o usuario."),
    );
  }

  return data as LoginResponse;
}

export async function fetchAuthenticatedUser(): Promise<AuthenticatedUser> {
  const response = await fetch("/api/auth/whoami", {
    headers: {
      Accept: "application/json",
    },
  });
  redirectToLoginOnUnauthorized(response);
  const data = await readJson<AuthenticatedUser | ApiErrorResponse>(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      getErrorMessage(
        errorData,
        "Nao foi possivel buscar o usuario autenticado.",
      ),
    );
  }

  return data as AuthenticatedUser;
}

export async function fetchTeacherClassrooms(): Promise<Classroom[]> {
  const response = await fetch("/api/turma/classrooms", {
    headers: {
      Accept: "application/json",
    },
  });
  redirectToLoginOnUnauthorized(response);
  const data = await readJson<Classroom[] | ApiErrorResponse>(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      getErrorMessage(errorData, "Nao foi possivel listar as turmas."),
    );
  }

  return Array.isArray(data) ? data : [];
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
}

export async function createUser(data: CreateUser) {
  const response = await fetch("/api/secretaria/usuario", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  redirectToLoginOnUnauthorized(response);

  const result = await response.json();

  console.log("STATUS:", response.status);
  console.log("RESULT:", result);

  if (!response.ok) {
    throw new Error(result.error ?? "Erro ao criar usuário");
  }

  return result;
}
