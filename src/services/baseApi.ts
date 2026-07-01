const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers } = options;

  // 1. Checa com segurança se está no navegador antes de pegar o token
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("khora_token") : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 🔥 TRATAMENTO DE AUTH (Apenas no Cliente)
  if (response.status === 401) {
    if (isClient) {
      localStorage.clear();
      window.location.href = "/login";
    }
    throw new Error("Não autorizado");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || error?.error || "Erro na requisição");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "GET", headers }),

  post: <T>(endpoint: string, body: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "POST", body, headers }),

  put: <T>(endpoint: string, body: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "PUT", body, headers }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "DELETE", headers }),
};
