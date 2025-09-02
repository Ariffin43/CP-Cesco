import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { normalizeStatus, parseDateOnly, toYmdFromDateOnly } from "../../../../lib/dateUtils";

export async function PUT(req, { params }) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    const start = parseDateOnly(body.startDate);
    const end = parseDateOnly(body.endDate);
    if (!start || !end || end < start) {
      return NextResponse.json(
        { message: "Tanggal tidak valid. Gunakan YYYY-MM-DD; End >= Start." },
        { status: 400 }
      );
    }

    const status = normalizeStatus(body.status);
    const allowed = new Set(["Pending", "Ongoing", "Finish", "Cancel"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    // add_duration (optional)
    let add_duration = null;
    if (body.add_duration !== undefined && body.add_duration !== null && body.add_duration !== "") {
      const n = Number(body.add_duration);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ message: "add_duration harus angka ≥ 0 atau kosong." }, { status: 400 });
      }
      add_duration = n;
    }

    let contract_type = null;
    if (typeof body.contract_type === "string") {
      const v = body.contract_type.trim();
      if (v === "LUMPSUM" || v === "DAILY_RATE") {
        contract_type = v;
      } else if (v === "") {
        contract_type = null; // kosong -> null
      } else if (v === "DAILY RATE") {
        contract_type = "DAILY_RATE"; // perbaiki import yang pakai spasi
      } else {
        return NextResponse.json({ message: "contract_type tidak valid" }, { status: 400 });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        jobNo: String(body.jobNo ?? "").trim(),
        customer: String(body.customer ?? "").trim(),
        projectName: String(body.projectName ?? "").trim(),
        description: String(body.description ?? "").trim(),
        startDate: start,
        endDate: end,
        status,
        pic: (body.pic && String(body.pic).trim()) || "-",
        contract_type,
        add_duration,
      },
    });


    return NextResponse.json({
      id: Number(updated.id),
      jobNo: updated.jobNo,
      customer: updated.customer,
      projectName: updated.projectName,
      description: updated.description,
      startDate: toYmdFromDateOnly(updated.startDate),
      endDate: toYmdFromDateOnly(updated.endDate),
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

// DELETE /api/projects/:id
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
