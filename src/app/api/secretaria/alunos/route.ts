import { listUsersByRole } from "@/app/api/secretaria/_lib/listUsersByRole";

export const runtime = "nodejs";

export async function GET() {
  return listUsersByRole("Aluno");
}
