import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const c = await prisma.certif.findUnique({
      where: { id },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    if (!c) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: Number(c.id),
      title: c.title,
      imageUrl: `/api/certif/${c.id}/image?ts=${new Date(c.updatedAt ?? Date.now()).getTime()}`,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  } catch (err) {
    console.error(`GET /api/certif/${id} error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const ct = req.headers.get("content-type") || "";

    // Jika multipart -> update title + optional file
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const title = String(form.get("title") || "").trim();
      const maybeFile = form.get("file");

      if (!title) {
        return NextResponse.json({ message: "Title wajib diisi." }, { status: 400 });
      }

      const data = { title };

      if (maybeFile instanceof File) {
        const allowed = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(maybeFile.type)) {
          return NextResponse.json({ message: "Hanya JPG, JPEG, PNG yang diperbolehkan." }, { status: 400 });
        }
        const buf = Buffer.from(await maybeFile.arrayBuffer());
        if (buf.length > 5 * 1024 * 1024) {
          return NextResponse.json({ message: "Ukuran maksimal 5MB." }, { status: 400 });
        }
        data.image = buf;
      }

      const updated = await prisma.certif.update({
        where: { id },
        data,
      });

      return NextResponse.json({
        id: Number(updated.id),
        title: updated.title,
        imageUrl: `/api/certif/${updated.id}/image?ts=${new Date(updated.updatedAt ?? Date.now()).getTime()}`,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    }

    // Jika JSON -> hanya update title
    const body = await req.json();
    const title = body?.title !== undefined ? String(body.title).trim() : undefined;
    if (title === undefined || title === "") {
      return NextResponse.json({ message: "Title wajib diisi." }, { status: 400 });
    }

    const updated = await prisma.certif.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json({
      id: Number(updated.id),
      title: updated.title,
      imageUrl: `/api/certif/${updated.id}/image?ts=${new Date(updated.updatedAt ?? Date.now()).getTime()}`,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error(`PUT /api/certif/${id} error:`, err);
    if (String(err).includes("Record to update not found")) {
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
    await prisma.certif.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(`DELETE /api/certif/${id} error:`, err);
    if (String(err).includes("Record to delete does not exist")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
