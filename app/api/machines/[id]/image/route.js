import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fallback PNG transparan 1x1 (supaya <Image> gak error kalau null)
const FALLBACK = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHVQL3oU8tZQAAAABJRU5ErkJggg==",
  "base64"
);

function sniffMime(u8) {
  if (!u8 || u8.length < 4) return "image/png";
  if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) return "image/png"; // PNG
  if (u8[0] === 0xff && u8[1] === 0xd8) return "image/jpeg"; // JPEG
  if (u8[0] === 0x47 && u8[1] === 0x49 && u8[2] === 0x46) return "image/gif"; // GIF
  return "image/png";
}

export async function GET(_req, ctx) {
  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
  }

  try {
    const row = await prisma.machines.findUnique({
      where: { id: numericId },
      select: { image: true, updatedAt: true },
    });

    if (!row || !row.image) {
      return new NextResponse(FALLBACK, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=300",
          "Content-Length": String(FALLBACK.length),
        },
      });
    }

    const buf = Buffer.from(row.image);
    const mime = sniffMime(buf);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=300",
        "Content-Length": String(buf.length),
      },
    });
  } catch (err) {
    console.error(`GET /api/machines/${id}/image error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
