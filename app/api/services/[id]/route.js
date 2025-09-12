import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req, ctx) {
  const { id } = await ctx.params; // penting: await
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  try {
    const service = await prisma.services.findUnique({
      where: { id: numericId },
      include: {
        machine_categories: {
          include: { machines: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("GET /api/service/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}
