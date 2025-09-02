import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET ALL
export async function GET() {
  try {
    const rows = await prisma.services.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// CREATE
export async function POST(req) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newService = await prisma.services.create({
      data: { name },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (err) {
    console.error("POST /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    const updated = await prisma.services.update({
      where: { id: Number(id) },
      data: {
        name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.services.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}