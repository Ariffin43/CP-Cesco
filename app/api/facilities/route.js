// app/api/facilities/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

const isDev = process.env.NODE_ENV !== "production";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 15 * 1024 * 1024;

// GET: kembalikan array (sesuai page kamu)
export async function GET() {
  try {
    const rows = await prisma.facilities.findMany({
      orderBy: { id: "desc" },
      select: { id: true, title: true, desc: true, created_at: true, updated_at: true },
    });

    const mapped = rows.map((f) => ({
      id: Number(f.id),
      title: f.title,
      desc: f.desc ?? null,
      imageUrl: `/api/facilities/${f.id}/image?ts=${new Date(f.updated_at ?? Date.now()).getTime()}`,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/facilities error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: isDev ? String(err) : undefined },
      { status: 500 }
    );
  }
}

// POST: create (wajib file)
export async function POST(req) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const desc = form.get("desc") != null ? String(form.get("desc")).trim() : null;
    const file = form.get("file");

    if (!title) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Image file is required (field name: 'file')." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type || "")) {
      return NextResponse.json(
        { message: `Only JPG/JPEG/PNG allowed. Got: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: `Max file size is 15MB. Got ${(file.size/1024/1024).toFixed(2)}MB.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const created = await prisma.facilities.create({
      data: {
        title,
        desc: desc || null,
        gambar: buffer,
      },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        title: created.title,
        desc: created.desc ?? null,
        imageUrl: `/api/facilities/${created.id}/image?ts=${new Date(created.updated_at ?? Date.now()).getTime()}`,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/facilities error:", e);
    return NextResponse.json(
      { message: "Failed to create", error: String(e) },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id") || "");
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Query param 'id' is required." }, { status: 400 });
    }

    const ct = req.headers.get("content-type") || "";
    const data = {};

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const title = form.get("title");
      const desc = form.get("desc");
      const file = form.get("file");

      if (title != null) data.title = String(title).trim();
      if (desc != null) data.desc = String(desc).trim();

      if (file && file instanceof File) {
        if (!ALLOWED.includes(file.type || "")) {
          return NextResponse.json({ message: `Only JPG/JPEG/PNG allowed. Got: ${file.type || "unknown"}` }, { status: 415 });
        }
        if (file.size > MAX_SIZE) {
          return NextResponse.json({ message: `Max file size is 15MB. Got ${(file.size/1024/1024).toFixed(2)}MB.` }, { status: 413 });
        }
        data.gambar = Buffer.from(await file.arrayBuffer());
      }
    } else if (ct.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (typeof body.title === "string") data.title = body.title.trim();
      if (typeof body.desc === "string") data.desc = body.desc.trim();
    } else {
      return NextResponse.json({ message: "Unsupported Content-Type." }, { status: 415 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No fields to update." }, { status: 400 });
    }

    // kalau updated_at tidak pakai @updatedAt, set manual
    data.updated_at = new Date();

    const updated = await prisma.facilities.update({
      where: { id },
      data,
      select: { id: true, title: true, desc: true, created_at: true, updated_at: true },
    });

    return NextResponse.json({
      id: Number(updated.id),
      title: updated.title,
      desc: updated.desc ?? null,
      imageUrl: `/api/facilities/${updated.id}/image?ts=${new Date(updated.updated_at ?? Date.now()).getTime()}`,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (e) {
    console.error("PUT /api/facilities error:", e);
    return NextResponse.json({ message: "Failed to update", error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => null);
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
    if (!ids.length) {
      return NextResponse.json({ message: "IDs required" }, { status: 400 });
    }

    const deleted = await prisma.facilities.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({ message: `Deleted ${deleted.count} item(s)`, count: deleted.count });
  } catch (err) {
    console.error("DELETE /api/facilities error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: isDev ? String(err) : undefined },
      { status: 500 }
    );
  }
}
