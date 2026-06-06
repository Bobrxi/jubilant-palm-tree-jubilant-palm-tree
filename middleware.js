import { NextResponse } from "next/server";

// Simple shared-password gate. Everything except the login page/route requires a
// cookie matching DASHBOARD_PASSWORD. If no password is configured the dashboard
// is open (so set DASHBOARD_PASSWORD in Vercel — see README).
export function middleware(req) {
  const pass = process.env.DASHBOARD_PASSWORD;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }
  if (!pass) return NextResponse.next();

  const cookie = req.cookies.get("dash_auth")?.value;
  if (cookie === pass) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
