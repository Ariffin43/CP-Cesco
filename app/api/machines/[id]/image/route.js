import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
  }

  try {
    const row = await prisma.machines.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!row || !row.image) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    let mime = "image/jpeg";
    const b = row.image;
    if (b?.[0] === 0x89 && b?.[1] === 0x50 && b?.[2] === 0x4e && b?.[3] === 0x47) {
      mime = "image/png";
    }

    return new NextResponse(row.image, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error(`GET /api/machines/${id}/image error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
