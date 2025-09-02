import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function GET(req) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
