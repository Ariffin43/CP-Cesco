// app/api/projects/bulk-import/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CHUNK = 500;

export async function POST(req) {
  try {
    const rows = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "Body harus array data" }, { status: 400 });
    }

    const data = rows.map(r => ({
      jobNo: String(r.jobNo || "").trim(),
      customer: String(r.customer || "").trim(),
      projectName: String(r.projectName || "").trim(),
      description: String(r.description || "").trim(),
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
      status: r.status || "Pending",
      pic: r.pic || "-",
      contract_type: r.contract_type ?? null,
      add_duration: r.add_duration ?? null,
    }));

    let total = 0;
    for (let i = 0; i < data.length; i += CHUNK) {
      const slice = data.slice(i, i + CHUNK);
      const res = await prisma.project.createMany({
        data: slice,
      });
      total += res.count;
    }

    return NextResponse.json({ inserted: total });
  } catch (e) {
    console.error("bulk-import error:", e);
    return NextResponse.json({ message: "Gagal bulk import" }, { status: 500 });
  }
}
