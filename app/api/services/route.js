// app/api/services/route.js
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma"; // <- default import (sesuaikan dengan file Anda)
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";          // <- penting karena pakai fs
export const dynamic = "force-dynamic";   // optional: cegah cache static untuk GET

function safeFilename(name = "") {
  // buang karakter aneh, cegah path traversal
  const base = path.basename(name).replace(/[^\w.\-]/g, "_");
  return base || `file_${Date.now()}`;
}

function isValidId(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function saveIconFile(file) {
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) return null;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "icons");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${safeFilename(file.name || "icon")}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  // URL publik (karena disimpan di /public)
  return `/uploads/icons/${filename}`;
}

/* ===================== GET /api/services ===================== */
export async function GET() {
  try {
    const rows = await prisma.services.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, desc: true, icon: true, updatedAt: true, createdAt: true },
    });
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/* ===================== POST /api/services ===================== */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") || "").toString().trim();
    const desc = (formData.get("desc") || "").toString();
    const file = formData.get("icon");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const iconUrl = await saveIconFile(file);

    const newService = await prisma.services.create({
      data: { name, desc, icon: iconUrl },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (err) {
    console.error("POST /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/* ===================== PUT /api/services ===================== */
export async function PUT(req) {
  try {
    const formData = await req.formData();
    const idRaw = formData.get("id");
    const name = (formData.get("name") || "").toString().trim();
    const desc = (formData.get("desc") || "").toString();
    const file = formData.get("icon");

    const id = isValidId(idRaw);
    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    const updateData = { name, desc, updatedAt: new Date() };

    // kalau ada file baru, simpan dan update icon
    const newIconUrl = await saveIconFile(file);
    if (newIconUrl) updateData.icon = newIconUrl;

    const updated = await prisma.services.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/* ===================== DELETE /api/services?id=123 ===================== */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = isValidId(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.services.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
