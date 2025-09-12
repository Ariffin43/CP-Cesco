// app/api/facilities/[id]/image/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return new NextResponse("Bad Request", { status: 400 });

    const row = await prisma.facilities.findUnique({
      where: { id },
      select: { gambar: true },
    });

    const buf = row?.gambar;
    if (!buf) return new NextResponse("Not Found", { status: 404 });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg", // kalau kamu simpan mime type, set dinamis
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("GET /api/facilities/[id]/image error:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
