import { proxyBffJson, readJsonPayload } from "@/lib/bff";

export async function POST(request: Request) {
  const body = await readJsonPayload(request);

  console.log(body);

  return proxyBffJson({
    method: "POST",
    path: "/api/v1/auth/user",
    body,
    errorMessage: "Erro ao criar usuario",
  });
}
