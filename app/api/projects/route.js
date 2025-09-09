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
    const bodyRaw = await req.json();

    const normStr = (v) => String(v ?? "").trim();

    const jobNo       = normStr(bodyRaw.jobNo);
    const customer    = normStr(bodyRaw.customer);
    const projectName = normStr(bodyRaw.projectName);
    const description = normStr(bodyRaw.description);
    const picRaw      = normStr(bodyRaw.pic);

    if (!jobNo || !customer || !projectName || !description) {
      return NextResponse.json(
        { message: "Field wajib: jobNo, customer, projectName, description." },
        { status: 400 }
      );
    }

    if (jobNo.length > 64) {
      return NextResponse.json({ message: "jobNo maksimal 64 karakter." }, { status: 400 });
    }
    if (customer.length > 256) {
      return NextResponse.json({ message: "customer maksimal 256 karakter." }, { status: 400 });
    }
    if (projectName.length > 256) {
      return NextResponse.json({ message: "projectName maksimal 256 karakter." }, { status: 400 });
    }
    if (picRaw && picRaw.length > 128) {
      return NextResponse.json({ message: "pic maksimal 128 karakter." }, { status: 400 });
    }

    const start = parseDateOnly(bodyRaw.startDate);
    const end   = parseDateOnly(bodyRaw.endDate);
    if (!start || !end || end < start) {
      return NextResponse.json(
        { message: "Tanggal tidak valid. Gunakan YYYY-MM-DD; End >= Start." },
        { status: 400 }
      );
    }

    const status = normalizeStatus(bodyRaw.status);
    const allowed = new Set(["Pending", "Ongoing", "Finish", "Cancel"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
    }

    let add_duration_normalized;
    if (bodyRaw.add_duration !== undefined) {
      if (bodyRaw.add_duration === null || bodyRaw.add_duration === "") {
        add_duration_normalized = null;
      } else {
        const n = Number(bodyRaw.add_duration);
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json(
            { message: "add_duration harus angka ≥ 0 atau kosong." },
            { status: 400 }
          );
        }
        add_duration_normalized = n;
      }
    }

    let contract_type_normalized;
    if (bodyRaw.contract_type !== undefined) {
      const v = normStr(bodyRaw.contract_type);
      if (!v) {
        contract_type_normalized = null;
      } else if (v === "LUMPSUM" || v === "DAILY_RATE") {
        contract_type_normalized = v;
      } else if (v === "DAILY RATE") {
        contract_type_normalized = "DAILY_RATE";
      } else {
        return NextResponse.json({ message: "contract_type tidak valid." }, { status: 400 });
      }
    }

    const duplicate = await prisma.project.findFirst({
      where: {
        jobNo,
        projectName,
      },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { message: "Data duplikat: kombinasi jobNo & projectName sudah ada." },
        { status: 409 }
      );
    }

    const data = {
      jobNo,
      customer,
      projectName,
      description,
      startDate: start,
      endDate: end,
      status,
      pic: picRaw || "-",
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
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      { status: 201 }
    );
  } catch (e) {
    const msg = (e && e.code)
      ? `Prisma error ${e.code}: ${e.meta?.target ?? ""}`.trim()
      : String(e);

    if (e?.code === "P2002") {
      return NextResponse.json(
        { message: "Duplikat data melanggar constraint unik.", error: msg },
        { status: 409 }
      );
    }
    if (e?.code === "P2000") {
      return NextResponse.json(
        { message: "Nilai terlalu panjang untuk kolom tertentu.", error: msg },
        { status: 400 }
      );
    }

    console.error("POST /api/projects error:", e);
    return NextResponse.json({ message: "Gagal membuat project", error: msg }, { status: 500 });
  }
}