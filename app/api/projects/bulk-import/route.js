// app/api/projects/bulk-import/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus, parseDateOnly } from "@/lib/dateUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // beri napas utk transaksi besar

// helper kecil
const norm = (v) => String(v ?? "").trim();

export async function POST(req) {
  try {
    const rows = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "Body harus berupa array." }, { status: 400 });
    }

    const mapped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const jobNo       = norm(r.jobNo);
      const customer    = norm(r.customer);
      const projectName = norm(r.projectName);
      const description = norm(r.description);
      const pic         = norm(r.pic || "-");

      if (!jobNo || !customer || !projectName || !description) {
        errors.push({ index: i, error: "Field wajib kosong (jobNo/customer/projectName/description)." });
        continue;
      }

      const start = parseDateOnly(r.startDate);
      const end   = parseDateOnly(r.endDate);
      if (!start || !end || end < start) {
        errors.push({ index: i, error: "Tanggal tidak valid (YYYY-MM-DD) atau end < start." });
        continue;
      }

      const st = normalizeStatus(r.status);
      if (!["Pending","Ongoing","Finish","Cancel"].includes(st)) {
        errors.push({ index: i, error: "Status tidak valid." });
        continue;
      }

      mapped.push({
        jobNo,
        customer,
        projectName,
        description,
        startDate: start,
        endDate: end,
        status: st,
        pic,
        contract_type: r.contract_type ?? null,
        add_duration:  r.add_duration ?? null,
      });
    }

    if (mapped.length === 0) {
      return NextResponse.json({ message: "Tidak ada baris valid.", errors }, { status: 400 });
    }

    const CHUNK = 300;
    let inserted = 0;

    for (let i = 0; i < mapped.length; i += CHUNK) {
      const slice = mapped.slice(i, i + CHUNK);
      const res = await prisma.project.createMany({
        data: slice,
      });
      inserted += res.count;
    }

    return NextResponse.json(
      { message: "OK", inserted, failed: errors.length, errors },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e) {
    console.error("POST /api/projects/bulk-import error:", e);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
