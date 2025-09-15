import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus, parseDateOnly, toYmdFromDateOnly } from "@/lib/dateUtils";

function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  // buang jam supaya tetap tipe DATE (bukan datetime) aman ke @db.Date
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function PUT(req, { params }) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    // 1) Ambil record lama
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Project tidak ditemukan" }, { status: 404 });
    }

    const jobNo       = String(body.jobNo ?? "").trim();
    const customer    = String(body.customer ?? "").trim();
    const projectName = String(body.projectName ?? "").trim();
    const description = String(body.description ?? "").trim();
    const pic         = (body.pic && String(body.pic).trim()) || "-";

    const status = normalizeStatus(body.status);
    const allowed = new Set(["Pending", "Ongoing", "Finish", "Cancel"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const start = parseDateOnly(body.startDate);
    if (!start) {
      return NextResponse.json({ message: "startDate tidak valid (YYYY-MM-DD)" }, { status: 400 });
    }
    
    let baseEnd = null;
    if (body.endDate !== undefined && body.endDate !== null && String(body.endDate).trim() !== "") {
      baseEnd = parseDateOnly(body.endDate);
      if (!baseEnd) {
        return NextResponse.json({ message: "endDate tidak valid (YYYY-MM-DD)" }, { status: 400 });
      }
    } else {
      baseEnd = existing.endDate;
    }

    let inc = null;
    if (body.add_duration !== undefined && body.add_duration !== null && body.add_duration !== "") {
      const n = Number(body.add_duration);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ message: "add_duration harus angka ≥ 0 atau kosong." }, { status: 400 });
      }
      inc = n;
    }

    let finalEnd = baseEnd;
    let finalAdd = existing.add_duration ?? 0;

    if (inc !== null && inc > 0) {
      const anchor = finalEnd || start; // kalau belum ada endDate, pakai startDate sebagai anchor
      finalEnd = addDays(anchor, inc);
      finalAdd = finalAdd + inc;
    }

    // Validasi urutan tanggal (kalau finalEnd ada)
    if (finalEnd && finalEnd < start) {
      return NextResponse.json({ message: "End tidak boleh < Start." }, { status: 400 });
    }

    let contract_type = existing.contract_type ?? null;
    if (typeof body.contract_type === "string") {
      const v = body.contract_type.trim();
      if (v === "") {
        contract_type = null;
      } else if (v === "LUMPSUM" || v === "DAILY_RATE") {
        contract_type = v;
      } else if (v === "DAILY RATE") {
        contract_type = "DAILY_RATE";
      } else {
        return NextResponse.json({ message: "contract_type tidak valid" }, { status: 400 });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        jobNo,
        customer,
        projectName,
        description,
        startDate: start,
        endDate: finalEnd,
        status,
        pic,
        contract_type,
        add_duration: finalAdd,
      },
    });

    return NextResponse.json({
      id: Number(updated.id),
      jobNo: updated.jobNo,
      customer: updated.customer,
      projectName: updated.projectName,
      description: updated.description,
      startDate: toYmdFromDateOnly(updated.startDate),
      endDate: updated.endDate ? toYmdFromDateOnly(updated.endDate) : null,
      status: updated.status,
      pic: updated.pic ?? "-",
      contract_type: updated.contract_type ?? null,
      add_duration: updated.add_duration ?? 0,
    });
  } catch (e) {
    console.error("PUT /api/projects/[id] error:", e);
    return NextResponse.json({ message: "Gagal update project", error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = BigInt(params.id);
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/projects/[id] error:", e);
    return NextResponse.json({ message: "Gagal hapus project", error: String(e) }, { status: 500 });
  }
}