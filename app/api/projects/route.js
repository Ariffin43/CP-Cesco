import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { normalizeStatus, parseDateOnly, toYmdFromDateOnly } from "../../../lib/dateUtils";

export async function GET() {
  try {
    const rows = await prisma.project.findMany({ orderBy: { id: "desc" } });
    const mapped = rows.map((p) => ({
      id: Number(p.id),
      jobNo: p.jobNo,
      customer: p.customer,
      projectName: p.projectName,
      description: p.description,
      startDate: toYmdFromDateOnly(p.startDate),
      endDate: toYmdFromDateOnly(p.endDate),
      status: p.status,
      pic: p.pic ?? "-",
      contract_type: p.contract_type ?? null,
      add_duration: p.add_duration ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
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
    let add_duration_normalized;
    if (body.add_duration !== undefined) {
      if (body.add_duration === null || body.add_duration === "") {
        add_duration_normalized = null;
      } else {
        const n = Number(body.add_duration);
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json({ message: "add_duration harus angka ≥ 0 atau kosong." }, { status: 400 });
        }
        add_duration_normalized = n;
      }
    }

    // contract_type (optional)
    let contract_type_normalized;
    if (body.contract_type !== undefined) {
      const v = String(body.contract_type).trim();
      if (v === "") {
        contract_type_normalized = null;
      } else if (v === "LUMPSUM" || v === "DAILY_RATE") {
        contract_type_normalized = v;
      } else if (v === "DAILY RATE") {
        contract_type_normalized = "DAILY_RATE";
      } else {
        return NextResponse.json({ message: "contract_type tidak valid" }, { status: 400 });
      }
    }

    const data = {
      jobNo: String(body.jobNo ?? "").trim(),
      customer: String(body.customer ?? "").trim(),
      projectName: String(body.projectName ?? "").trim(),
      description: String(body.description ?? "").trim(),
      startDate: start,
      endDate: end,
      status,
      pic: (body.pic && String(body.pic).trim()) || "-",
      ...(contract_type_normalized !== undefined && { contract_type: contract_type_normalized }),
      ...(add_duration_normalized !== undefined && { add_duration: add_duration_normalized }),
    };

    const created = await prisma.project.create({ data });

    return NextResponse.json(
      {
        id: Number(created.id),
        jobNo: created.jobNo,
        customer: created.customer,
        projectName: created.projectName,
        description: created.description,
        startDate: toYmdFromDateOnly(created.startDate),
        endDate: toYmdFromDateOnly(created.endDate),
        status: created.status,
        pic: created.pic ?? "-",
        contract_type: created.contract_type ?? null,
        add_duration: created.add_duration ?? 0,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/projects error:", e);
    return NextResponse.json({ message: "Gagal membuat project", error: String(e) }, { status: 500 });
  }
}