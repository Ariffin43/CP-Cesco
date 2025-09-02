// lib/dateUtils.js
export function normalizeStatus(s) {
  const t = String(s || "").trim().toLowerCase();
  if (t === "finish" || t === "finished" || t === "completed") return "Finish";
  if (t === "ongoing" || t === "in progress" || t === "progress") return "Ongoing";
  if (t === "cancel" || t === "cancelled" || t === "canceled") return "Cancel";
  return "Pending";
}

// Parse "YYYY-MM-DD" menjadi Date di UTC midnight (hindari offset TZ)
export function parseDateOnly(v) {
  if (!v) return null;
  const parts = String(v).split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return isNaN(dt.getTime()) ? null : dt;
}

// Ubah Date (kolom @db.Date) menjadi string "YYYY-MM-DD"
export function toYmdFromDateOnly(dt) {
  if (!dt) return "";
  return new Date(dt).toISOString().slice(0, 10);
}