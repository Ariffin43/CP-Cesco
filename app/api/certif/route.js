import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.certif.findMany({
      orderBy: { id: "asc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    const mapped = rows.map((c) => ({
      id: Number(c.id),
      title: c.title,
      imageUrl: `/api/certif/${c.id}/image?ts=${new Date(c.updatedAt ?? Date.now()).getTime()}`,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/certif error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const file = form.get("file");

    if (!title || !file) {
      return NextResponse.json({ message: "Title & file wajib diisi." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Field 'file' tidak valid." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ message: "Hanya JPG, JPEG, PNG yang diperbolehkan." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const MAX_SIZE = 30 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ message: "Ukuran maksimal 8MB." }, { status: 400 });
    }

    const created = await prisma.certif.create({
      data: { title, image: buffer },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        title: created.title,
        imageUrl: `/api/certif/${created.id}/image?ts=${new Date(created.updatedAt ?? Date.now()).getTime()}`,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/certif error:", e);
    return NextResponse.json({ message: "Gagal membuat certif", error: String(e) }, { status: 500 });
  }
}
