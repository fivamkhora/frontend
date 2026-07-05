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

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

function getErrorMessage(data: ApiErrorResponse, fallback: string) {
  return data.message || data.error || fallback;
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
    throw new Error(
      getErrorMessage(data, "Nao foi possivel autenticar o usuario."),
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
  const data = await readJson<AuthenticatedUser | ApiErrorResponse>(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Nao foi possivel buscar o usuario autenticado."),
    );
  }

  return data as AuthenticatedUser;
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
}
