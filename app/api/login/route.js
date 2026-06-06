import { NextResponse } from "next/server";

export async function POST(req) {
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    /* ignore */
  }
  const expected = process.env.DASHBOARD_PASSWORD;
  if (expected && password === expected) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("dash_auth", password, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
