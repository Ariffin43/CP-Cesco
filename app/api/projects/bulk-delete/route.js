// app/api/projects/bulk-delete/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
    if (!ids.length) {
      return NextResponse.json({ message: "IDs required" }, { status: 400 });
    }

    // potong untuk safety
    const CHUNK = 500;
    let total = 0;
    for (let i = 0; i < ids.length; i += CHUNK) {
      const slice = ids.slice(i, i + CHUNK);
      const del = await prisma.project.deleteMany({ where: { id: { in: slice } } });
      total += del.count;
    }

    return NextResponse.json({ message: `Deleted ${total} item(s)`, count: total });
  } catch (e) {
    console.error("DELETE /api/projects/bulk-delete error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
