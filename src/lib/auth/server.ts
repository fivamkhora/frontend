import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE, verifySessionCookie } from "./session";

export async function getAuthSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  return verifySessionCookie(cookieValue);
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
