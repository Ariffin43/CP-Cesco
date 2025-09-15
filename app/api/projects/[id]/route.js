import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus, parseDateOnly, toYmdFromDateOnly } from "@/lib/dateUtils";

// helper
function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // date-only
}
function diffDays(a, b) { // a - b (date-only)
  const ms = (new Date(a)).setHours(0,0,0,0) - (new Date(b)).setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}

export async function PUT(req, { params }) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Project tidak ditemukan" }, { status: 404 });

    const jobNo       = String(body.jobNo ?? "").trim();
    const customer    = String(body.customer ?? "").trim();
    const projectName = String(body.projectName ?? "").trim();
    const description = String(body.description ?? "").trim();
    const pic         = (body.pic && String(body.pic).trim()) || "-";

    const status = normalizeStatus(body.status);
    if (!["Pending","Ongoing","Finish","Cancel"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    const start = parseDateOnly(body.startDate);
    if (!start) return NextResponse.json({ message: "startDate tidak valid (YYYY-MM-DD)" }, { status: 400 });

    const prevTotal = existing.add_duration ?? 0;

    // --- REKONSTRUKSI BASELINE: endDate ketika add_duration = 0 ---
    // (endDate sekarang sudah termasuk prevTotal hari tambahan)
    let baselineEnd = existing.endDate ? addDays(existing.endDate, -prevTotal) : null;

    // Normalisasi add_duration baru (opsional)
    let newTotal = null;
    if (body.add_duration !== undefined) {
      if (body.add_duration === null || String(body.add_duration).trim() === "") newTotal = 0;
      else {
        const n = Number(body.add_duration);
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json({ message: "add_duration harus angka ≥ 0 atau kosong." }, { status: 400 });
        }
        newTotal = n;
      }
    }

    // Jika user kirim endDate TANPA ubah add_duration:
    // terima endDate apa adanya, lalu sinkronkan add_duration agar konsisten dengan baseline.
    // (kalau baseline belum ada, set baseline = endDate)
    let explicitEnd = null;
    if (body.endDate !== undefined && body.endDate !== null && String(body.endDate).trim() !== "") {
      explicitEnd = parseDateOnly(body.endDate);
      if (!explicitEnd) return NextResponse.json({ message: "endDate tidak valid (YYYY-MM-DD)" }, { status: 400 });
    }

    let finalEnd   = existing.endDate;   // default: tetap
    let finalTotal = prevTotal;          // default: tetap

    if (newTotal !== null) {
      // PRIORITAS: kalau add_duration dikirim, abaikan endDate dari body supaya tidak dobel-geser.
      // Hitung dari baseline -> finalEnd = baseline + newTotal
      if (!baselineEnd) baselineEnd = start; // jika belum ada baseline, pakai start
      finalEnd   = addDays(baselineEnd, newTotal);
      finalTotal = newTotal;
    } else if (explicitEnd) {
      // Hanya endDate yang diubah: set endDate langsung,
      // lalu perbarui add_duration agar = selisih dari baseline (≥ 0).
      finalEnd = explicitEnd;
      if (!baselineEnd) baselineEnd = finalEnd; // kalau belum ada baseline, anggap tanggal ini baseline
      const d = diffDays(finalEnd, baselineEnd);
      finalTotal = Math.max(0, d);
    }

    // Validasi urutan tanggal bila ada endDate
    if (finalEnd && finalEnd < start) {
      return NextResponse.json({ message: "End tidak boleh < Start." }, { status: 400 });
    }

    // contract_type opsional
    let contract_type = existing.contract_type ?? null;
    if (typeof body.contract_type === "string") {
      const v = body.contract_type.trim();
      if      (v === "")           contract_type = null;
      else if (v === "LUMPSUM" || v === "DAILY_RATE") contract_type = v;
      else if (v === "DAILY RATE") contract_type = "DAILY_RATE";
      else return NextResponse.json({ message: "contract_type tidak valid" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        jobNo,
        customer,
        projectName,
        description,
        startDate: start,
        endDate: finalEnd,            // bisa null kalau skema mengizinkan
        status,
        pic,
        contract_type,
        add_duration: finalTotal,     // total baru (bisa turun/naik)
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