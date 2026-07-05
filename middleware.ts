import { NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, verifySessionCookie } from "@/lib/auth/session";

const privatePageRoutes = ["/dashboard", "/confeccao", "/provas"];

function isPrivatePage(pathname: string) {
  return privatePageRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isPrivateApi(pathname: string) {
  return pathname.startsWith("/api/ia/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPrivatePage(pathname) && !isPrivateApi(pathname)) {
    return NextResponse.next();
  }

  const session = await verifySessionCookie(
    request.cookies.get(AUTH_SESSION_COOKIE)?.value,
  );

  if (session) {
    return NextResponse.next();
  }

  if (isPrivateApi(pathname)) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/confeccao/:path*",
    "/provas/:path*",
    "/api/ia/:path*",
  ],
};
