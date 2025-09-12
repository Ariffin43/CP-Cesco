import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    const row = await prisma.certif.findUnique({
      where: { id },
      select: { image: true },
    });
    if (!row?.image) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return new NextResponse(row.image, {
      status: 200,
      headers: {
        "Content-Type": "image/png", // atau "image/jpeg"
        "Cache-Control": "public, max-age=600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error(`GET /api/certif/${id}/image error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
