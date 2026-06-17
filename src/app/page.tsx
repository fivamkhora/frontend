import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona instantaneamente o usuário da raiz (/) para a tela de login
  redirect("/login");
}
