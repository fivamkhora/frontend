export type LoginResponse = {
  role: string;
  token: string;
};

type LoginErrorResponse = {
  error?: string;
  message?: string;
  upstreamResponse?: {
    detail?: string;
    error?: string;
    message?: string;
  };
};

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/signin", {
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
      errorData.upstreamResponse?.detail ||
        errorData.upstreamResponse?.message ||
        errorData.upstreamResponse?.error ||
        errorData.message ||
        errorData.error ||
        "Nao foi possivel autenticar o usuario.",
    );
  }

  return data as LoginResponse;
}
