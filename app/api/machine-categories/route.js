import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const runtime = "nodejs";

// GET list (ringan): kembalikan imageUrl, bukan bytes
export async function GET() {
  try {
    const rows = await prisma.machine_categories.findMany({
      orderBy: { createdAt: "asc" },
      include: { services: { select: { id: true, name: true } } },
    });

    const mapped = rows.map((r) => ({
      id: Number(r.id),
      service_id: r.service_id,
      serviceName: r.services?.name ?? null,
      name: r.name,
      desc: r.desc,
      imageUrl: `/api/machine-categories/${r.id}/image?ts=${
        r.updatedAt ? r.updatedAt.getTime() : Date.now()
      }`,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/machine-categories error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST (multipart/form-data)
export async function POST(req) {
  try {
    const form = await req.formData();
    const service_id = Number(form.get("service_id"));
    const name = String(form.get("name") ?? "").trim();
    const desc = String(form.get("desc") ?? "") || null;
    const file = form.get("file");

    if (!Number.isFinite(service_id) || !service_id || !name) {
      return NextResponse.json({ error: "service_id and name are required" }, { status: 400 });
    }

    let buffer = null;
    if (file && typeof file !== "string") {
      const mime = file.type || "";
      if (mime && !["image/png", "image/jpeg"].includes(mime)) {
        return NextResponse.json({ message: "Only PNG/JPEG allowed." }, { status: 415 });
      }
      const bytes = await file.arrayBuffer();
      if (bytes.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Max file size is 5MB." }, { status: 413 });
      }
      buffer = Buffer.from(bytes);
    }

    const created = await prisma.machine_categories.create({
      data: { service_id, name, desc, image: buffer },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        service_id: created.service_id,
        name: created.name,
        desc: created.desc,
        imageUrl: `/api/machine-categories/${created.id}/image?ts=${Date.now()}`,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/machine-categories error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT (multipart/form-data) — hanya timpa image bila ada file baru
export async function PUT(req) {
  try {
    const form = await req.formData();
    const id = Number(form.get("id"));
    const service_id = Number(form.get("service_id"));
    const name = String(form.get("name") ?? "").trim();
    const desc = String(form.get("desc") ?? "") || null;
    const file = form.get("file");

    if (!Number.isFinite(id) || !id || !Number.isFinite(service_id) || !service_id || !name) {
      return NextResponse.json({ error: "id, service_id and name are required" }, { status: 400 });
    }

    const data = { service_id, name, desc, updatedAt: new Date() };

    if (file && typeof file !== "string") {
      const mime = file.type || "";
      if (mime && !["image/png", "image/jpeg"].includes(mime)) {
        return NextResponse.json({ message: "Only PNG/JPEG allowed." }, { status: 415 });
      }
      const bytes = await file.arrayBuffer();
      if (bytes.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Max file size is 5MB." }, { status: 413 });
      }
      data.image = Buffer.from(bytes);
    }

    const updated = await prisma.machine_categories.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: Number(updated.id),
      service_id: updated.service_id,
      name: updated.name,
      desc: updated.desc,
      imageUrl: `/api/machine-categories/${updated.id}/image?ts=${Date.now()}`,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error("PUT /api/machine-categories error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.machine_categories.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/machine-categories error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
