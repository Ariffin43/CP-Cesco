import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_MB = 8;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function GET(_req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const g = await prisma.gallery.findUnique({
      where: { id },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    if (!g) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: Number(g.id),
      title: g.title,
      imageUrl: `/api/gallery/${g.id}/image?ts=${new Date(g.updatedAt ?? Date.now()).getTime()}`,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    });
  } catch (err) {
    console.error(`GET /api/gallery/${id} error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const ct = (req.headers.get("content-type") || "").toLowerCase();

    // multipart/form-data → update title + optional file
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const title = String(form.get("title") || "").trim();
      const file = form.get("file");

      if (!title) {
        return NextResponse.json({ message: "Title wajib diisi." }, { status: 400 });
      }

      const data = { title, updatedAt: new Date() };

      if (file && typeof file !== "string") {
        const mime = file.type || "";
        if (!ALLOWED_IMAGE_MIME.has(mime)) {
          return NextResponse.json(
            { message: "Format gambar tidak didukung. Hanya JPG/PNG/WebP." },
            { status: 415 }
          );
        }

        const bytes = await file.arrayBuffer();
        if (bytes.byteLength > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { message: `Ukuran file terlalu besar (max ${MAX_IMAGE_MB}MB).` },
            { status: 413 }
          );
        }

        data.image = Buffer.from(bytes);
      }

      const updated = await prisma.gallery.update({
        where: { id },
        data,
      });

      return NextResponse.json({
        id: Number(updated.id),
        title: updated.title,
        imageUrl: `/api/gallery/${updated.id}/image?ts=${new Date(updated.updatedAt ?? Date.now()).getTime()}`,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    }

    // application/json → hanya update title
    const body = await req.json().catch(() => null);
    const title = body?.title ? String(body.title).trim() : "";
    if (!title) {
      return NextResponse.json({ message: "Title wajib diisi." }, { status: 400 });
    }

    const updated = await prisma.gallery.update({
      where: { id },
      data: { title, updatedAt: new Date() },
    });

    return NextResponse.json({
      id: Number(updated.id),
      title: updated.title,
      imageUrl: `/api/gallery/${updated.id}/image?ts=${new Date(updated.updatedAt ?? Date.now()).getTime()}`,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error(`PUT /api/gallery/${id} error:`, err);
    const msg = String(err?.message || err);
    if (msg.includes("Record to update not found") || msg.includes("P2025")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    await prisma.gallery.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(`DELETE /api/gallery/${id} error:`, err);
    const msg = String(err?.message || err);
    if (msg.includes("Record to delete does not exist") || msg.includes("P2025")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
