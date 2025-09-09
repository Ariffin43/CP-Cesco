"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function BarChart({ items = [], page = 1, pages = 1, autoFetch = false }) {
  const wrapRef = useRef(null);

  const [tip, setTip] = useState({ show: false, x: 0, y: 0, lines: [] });

  const [remoteItems, setRemoteItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysBetween = (a, b) =>
    Math.max(0, Math.ceil((startOfDay(b) - startOfDay(a)) / 86400000));

  const parseFlexibleDate = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    const s = String(v).trim().replace(/\//g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
    const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const normalizeStatus = (s) => {
    const t = String(s || "").toLowerCase();
    if (t.includes("finish") || t.includes("completed")) return "COMPLETED";
    if (t.includes("ongoing") || t.includes("progress")) return "IN PROGRESS";
    if (t.includes("cancel")) return "CANCELLED";
    if (t.includes("pending")) return "NOT STARTED";
    return "NOT STARTED";
  };

  useEffect(() => {
    if (!autoFetch) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load projects");
        const raw = await res.json();

        const today = new Date();
        const mapped = raw.map((p) => {
          const jobNo = p.jobNo;
          const cust = p.customer;
          const projectName = p.projectName;
          const desc = p.description;
          const status = p.status;
          const s = parseFlexibleDate(p.startDate);
          const e = parseFlexibleDate(p.endDate);
          const label = normalizeStatus(status);

          const contractDuration = s && e ? daysBetween(s, e) : 0;

          let actualDuration = 0;
          let remainingDuration = 0;
          if (label === "COMPLETED" && s && e) {
            actualDuration = daysBetween(s, e);
          } else if (label === "IN PROGRESS" && s) {
            actualDuration = daysBetween(s, today);
            remainingDuration = e ? Math.max(0, daysBetween(today, e)) : 0;
          } else if (label === "NOT STARTED") {
            remainingDuration = e ? Math.max(0, daysBetween(today, e)) : 0;
          }

          return {
            id: Number(p.id),
            jobNo,
            cust,
            projectName,
            desc,
            statusLabel: label,
            startDate: p.startDate,
            endDate: p.endDate,
            startDateFmt: s ? s.toISOString() : null,
            endDateFmt: e ? e.toISOString() : null,
            contractDuration,
            actualDuration,
            remainingDuration,
            contractType: "",
            addDuration: 0,
          };
        });

        setRemoteItems(mapped);
      } catch (e) {
        console.error(e);
        setRemoteItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [autoFetch]);

  const data = autoFetch ? remoteItems : items;

  const showTip = (e, lines) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTip({ show: true, x, y, lines });
  };
  const hideTip = () => setTip((t) => ({ ...t, show: false }));

  const W = 1200,
    H = 360;
  const m = { t: 24, r: 20, b: 104, l: 44 };
  const cw = W - m.l - m.r;
  const ch = H - m.t - m.b;

  const maxY = Math.max(
    10,
    ...data.map((r) => Math.max(r.contractDuration || 0, r.actualDuration || 0))
  );

  const groups = Math.max(1, data.length);
  const gW = cw / groups;
  const barW = Math.min(22, gW * 0.28);
  const y = (val) => m.t + ch - (val / maxY) * ch;
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((maxY / 5) * i));

  const fmtDate = (val) =>
    val
      ? new Date(val).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  // Loading state kecil
  if (autoFetch && loading) {
    return (
      <div className="relative bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">
        Loading chart data…
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200">
      {/* Wrapper untuk posisi tooltip absolut */}
      <div ref={wrapRef} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-160">
          {/* grid & y-axis */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={m.l} y1={y(t)} x2={W - m.r} y2={y(t)} stroke="#e5e7eb" />
              <text
                x={m.l - 8}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {t}
              </text>
            </g>
          ))}

          {/* bars + x-labels */}
          {data.map((r, i) => {
            const cx = m.l + i * (cw / Math.max(1, data.length)) + (cw / Math.max(1, data.length)) / 2;
            const cVal = r.contractDuration || 0;
            const aVal = r.actualDuration || 0;

            const baseLines = [
              `${r.jobNo || ""} • ${r.projectName || ""}`.trim(),
              r.cust ? `Client: ${r.cust}` : null,
              r.statusLabel ? `Status: ${r.statusLabel}` : null,
            ].filter(Boolean);

            return (
              <g key={r.id ?? i}>
                {/* Contract (blue) */}
                <rect
                    x={cx - barW - 4}
                    y={y(cVal)}
                    width={barW}
                    height={Math.max(0, (cVal / maxY) * ch)}
                    fill="#3b82f6"
                    opacity="0.9"
                    rx="2"
                    style={{ transition: "opacity .2s, transform .2s" }}
                    onMouseEnter={(e) =>
                      showTip(e, [
                        ...baseLines,
                        `Type: CONTRACT`,
                        `Duration: ${cVal} day(s)`,
                        `${fmtDate(r.startDateFmt || r.startDate)} → ${fmtDate(
                          r.endDateFmt || r.endDate
                        )}`,
                      ])
                    }
                    onMouseMove={(e) =>
                      showTip(e, [
                        ...baseLines,
                        `Type: CONTRACT`,
                        `Duration: ${cVal} day(s)`,
                        `${fmtDate(r.startDateFmt || r.startDate)} → ${fmtDate(
                          r.endDateFmt || r.endDate
                        )}`,
                      ])
                    }
                    onMouseLeave={hideTip}
                />

                {/* Actual (orange) */}
                <rect
                  x={cx + 4}
                  y={y(aVal)}
                  width={barW}
                  height={Math.max(0, (aVal / maxY) * ch)}
                  fill="#f59e0b"
                  opacity="0.9"
                  rx="2"
                  style={{ transition: "opacity .2s, transform .2s" }}
                  onMouseEnter={(e) =>
                    showTip(e, [
                      ...baseLines,
                      `Type: ACTUAL`,
                      `Duration: ${aVal} day(s)`,
                    ])
                  }
                  onMouseMove={(e) =>
                    showTip(e, [
                      ...baseLines,
                      `Type: ACTUAL`,
                      `Duration: ${aVal} day(s)`,
                    ])
                  }
                  onMouseLeave={hideTip}
                />

                {/* x labels */}
                <text x={cx} y={H - m.b + 18} fontSize="11" fill="#374151" textAnchor="middle">
                  {fmtDate(r.startDateFmt || r.startDate)}
                </text>
                <text x={cx} y={H - m.b + 34} fontSize="11" fill="#6b7280" textAnchor="middle">
                  {fmtDate(r.endDateFmt || r.endDate)}
                </text>
                <text x={cx} y={H - m.b + 50} fontSize="11" fill="#111827" textAnchor="middle">
                  {(r.projectName || r.jobNo || "").slice(0, 22)}
                </text>
                <text x={cx} y={H - m.b + 66} fontSize="11" fill="#374151" textAnchor="middle">
                  {(r.cust || "").slice(0, 22)}
                </text>
                <text x={cx} y={H - m.b + 82} fontSize="11" fill="#6b7280" textAnchor="middle">
                  {r.jobNo}
                </text>
                <text x={cx} y={H - m.b + 98} fontSize="11" fill="#059669" textAnchor="middle">
                  {r.statusLabel}
                </text>
              </g>
            );
          })}

          {/* legend */}
          <g transform={`translate(${W / 2 - 70}, ${m.t - 10})`}>
            <rect x="0" y="-10" width="12" height="12" fill="#3b82f6" />
            <text x="18" y="0" dominantBaseline="central" fontSize="12" fill="#374151">Contract</text>
            <rect x="90" y="-10" width="12" height="12" fill="#f59e0b" />
            <text x="108" y="0" dominantBaseline="central" fontSize="12" fill="#374151">Actual</text>
          </g>
        </svg>

        {/* Tooltip */}
        {tip.show && (
          <div
            className="pointer-events-none absolute z-10 max-w-xs rounded-lg border border-gray-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur"
            style={{ left: tip.x + 14, top: tip.y + 14 }}
          >
            <ul className="space-y-1">
              {tip.lines.map((ln, idx) => (
                <li key={idx} className={idx === 0 ? "font-semibold text-gray-900" : "text-gray-700"}>
                  {ln}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
