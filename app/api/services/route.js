// app/api/services/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function isValidId(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET() {
  try {
    const rows = await prisma.services.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, desc: true, icon: true, updatedAt: true, createdAt: true },
    });

    const mapped = rows.map((r) => ({
      ...r,
      icon: r.icon ? `data:image/png;base64,${Buffer.from(r.icon).toString("base64")}` : null,
    }));

    return NextResponse.json(mapped, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "";
    const desc = formData.get("desc")?.toString() || "";
    const file = formData.get("icon");

    let iconBytes = null;
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const bytes = await file.arrayBuffer();
      iconBytes = Buffer.from(bytes); // ✅ konversi ke Buffer untuk bytea
    }

    const newService = await prisma.services.create({
      data: {
        name,
        desc,
        icon: iconBytes, // ✅ simpan sebagai bytea
      },
    });

    return NextResponse.json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const idRaw = formData.get("id");
    const name = (formData.get("name") || "").toString().trim();
    const desc = (formData.get("desc") || "").toString();
    const file = formData.get("icon");

    const id = Number(idRaw);
    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    const updateData = {
      name,
      desc,
      updatedAt: new Date(),
    };

    // ✅ kalau ada file baru, convert jadi Buffer dan simpan ke DB
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const bytes = await file.arrayBuffer();
      updateData.icon = Buffer.from(bytes); // simpan ke bytea
    }

    const updated = await prisma.services.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/services error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

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
