import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.gallery.findMany({
      orderBy: { id: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    const mapped = rows.map((g) => ({
      id: Number(g.id),
      title: g.title,
      imageUrl: `/api/gallery/${g.id}/image?ts=${g.updatedAt ? g.updatedAt.getTime() : Date.now()}`,
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
    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "Image file is required." }, { status: 400 });
    }

    const mime = file.type || "";
    if (!["image/png", "image/jpeg"].includes(mime)) {
      return NextResponse.json({ message: "Only PNG/JPEG allowed." }, { status: 415 });
    }
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Max file size is 5MB." }, { status: 413 });
    }

    const buffer = Buffer.from(bytes);
    const created = await prisma.gallery.create({
      data: { title, image: buffer },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        title: created.title,
        imageUrl: `/api/gallery/${created.id}/image?ts=${Date.now()}`,
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
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];

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
      { error: "Internal Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}