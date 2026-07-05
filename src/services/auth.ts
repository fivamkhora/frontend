export type LoginResponse = {
  role: string;
};

type LoginErrorResponse = {
  error?: string;
  message?: string;
};

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

  const data = (await response.json()) as LoginResponse | LoginErrorResponse;

  if (!response.ok) {
    const errorData = data as LoginErrorResponse;

    throw new Error(
      errorData.message ||
        errorData.error ||
        "Nao foi possivel autenticar o usuario.",
    );
  }

  return data as LoginResponse;
}
