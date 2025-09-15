// app/api/projects/bulk-delete/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
    if (!ids.length) return NextResponse.json({ message: "IDs required" }, { status: 400 });

    const del = await prisma.project.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ deleted: del.count });
  } catch (e) {
    console.error("bulk-delete error:", e);
    return NextResponse.json({ message: "Gagal bulk delete" }, { status: 500 });
  }
}
