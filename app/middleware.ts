import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Auth-Middleware — schützt ALLE Pages außer:
 *   - /login (Login-Page selbst)
 *   - /api/auth/* (Auth-Endpoints)
 *   - Static-Assets (_next, favicon, etc.)
 *
 * Wenn nicht authentisiert → Redirect auf /login mit ?from=<originalPath>
 */

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Whitelist Pfade die ohne Auth erreichbar sind
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  // Nicht eingeloggt → Login mit Return-URL
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Welche Pfade durchläuft die Middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
