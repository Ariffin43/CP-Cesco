// app/api/gallery/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
const isDev = process.env.NODE_ENV !== "production";

export async function GET() {
  try {
    const rows = await prisma.gallery.findMany({
      orderBy: { id: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    const mapped = rows.map((g) => ({
      id: Number(g.id),
      title: g.title,
      imageUrl: `/api/gallery/${g.id}/image?ts=${new Date(g.updatedAt ?? Date.now()).getTime()}`,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: isDev ? String(err) : undefined },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const file = form.get("file");

    if (!title) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ message: "Image file is required (field name: 'file')." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Field 'file' must be a file." }, { status: 400 });
    }

    // ✅ Validasi tipe file
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type || "")) {
      return NextResponse.json({ message: `Only JPG/JPEG/PNG allowed. Got: ${file.type || "unknown"}` }, { status: 415 });
    }

    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: `Max file size is 8MB. Got ${(file.size/1024/1024).toFixed(2)}MB.` }, { status: 413 });
    }

    // Baca konten setelah lolos cek
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // (Opsional) double-check jika perlu
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ message: "Max file size is 8MB (buffer exceeded)." }, { status: 413 });
    }

    const created = await prisma.gallery.create({
      data: { title, image: buffer },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        title: created.title,
        imageUrl: `/api/gallery/${created.id}/image?ts=${new Date(created.updatedAt ?? Date.now()).getTime()}`,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/gallery error:", e);
    return NextResponse.json({ message: "Failed to create", error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];

    if (!ids.length) {
      return NextResponse.json({ message: "IDs required" }, { status: 400 });
    }

    const deleted = await prisma.gallery.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      message: `Deleted ${deleted.count} item(s)`,
      count: deleted.count,
    });
  } catch (err) {
    console.error("DELETE /api/gallery error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: isDev ? String(err) : undefined },
      { status: 500 }
    );
  }
}
