// app/api/company-profile/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
const isDev = process.env.NODE_ENV !== "production";

/* Helpers (sinkron dengan file root) */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const normUrl = (v) => {
  if (!v) return "";
  return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
};
const isValidUrl = (v) => {
  if (!v) return true;
  try { new URL(v); return true; } catch { return false; }
};

function sanitizePayload(body) {
  const name = String(body?.name ?? "").trim() || null;
  const contactPhone = String(body?.contactPhone ?? "").trim() || null;
  const contactWhatsapp = String(body?.contactWhatsapp ?? "").trim() || null;
  const address = String(body?.address ?? "").trim() || null;

  const emailsArr = Array.isArray(body?.emails) ? body.emails : [];
  const emails = emailsArr
    .map((e) => String(e || "").trim())
    .filter(Boolean);

  const socialRaw = body?.social ?? {};
  const social = {
    instagram: normUrl(socialRaw?.instagram || ""),
    linkedin:  normUrl(socialRaw?.linkedin  || ""),
    facebook:  normUrl(socialRaw?.facebook  || ""),
    x:         normUrl(socialRaw?.x         || ""),
  };

  return { name, contactPhone, contactWhatsapp, address, emails, social };
}

function validatePayload({ emails, social }) {
  if (!Array.isArray(emails) || emails.length === 0) {
    return "Minimal satu email wajib diisi.";
  }
  const bad = emails.find((e) => !isValidEmail(e));
  if (bad) return `Email tidak valid: ${bad}`;

  const badSoc = Object.entries(social).find(([, url]) => url && !isValidUrl(url));
  if (badSoc) return `URL ${badSoc[0]} tidak valid.`;

  return null;
}

/* ========================== GET /:id ========================== */
export async function GET(_req, { params }) {
  try {
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    const row = await prisma.companyProfile.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/company-profile/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: isDev ? String(err) : undefined },
      { status: 500 }
    );
  }
}

/* ========================== PUT /:id (update) ========================== */
export async function PUT(req, { params }) {
  try {
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const payload = sanitizePayload(body);
    const errMsg = validatePayload(payload);
    if (errMsg) {
      return NextResponse.json({ message: errMsg }, { status: 400 });
    }

    const updated = await prisma.companyProfile.update({
      where: { id },
      data: {
        name: payload.name,
        contactPhone: payload.contactPhone,
        contactWhatsapp: payload.contactWhatsapp,
        address: payload.address,
        emails: payload.emails,
        social: payload.social,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/company-profile/[id] error:", err);
    // Prisma throw jika not found
    const msg = String(err || "");
    const notFound = msg.includes("Record to update not found");
    return NextResponse.json(
      { error: notFound ? "Not found" : "Failed to update", detail: isDev ? msg : undefined },
      { status: notFound ? 404 : 500 }
    );
  }
}

/* ========================== DELETE /:id ========================== */
export async function DELETE(_req, { params }) {
  try {
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    await prisma.companyProfile.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/company-profile/[id] error:", err);
    const msg = String(err || "");
    const notFound = msg.includes("Record to delete does not exist");
    return NextResponse.json(
      { error: notFound ? "Not found" : "Failed to delete", detail: isDev ? msg : undefined },
      { status: notFound ? 404 : 500 }
    );
  }
}
