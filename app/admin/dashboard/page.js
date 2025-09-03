"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import { FaBars, FaUser, FaSignOutAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import BarChart from "../../components/BarChart";
import Sidebar from "../../components/Sidebar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a, b) => Math.max(0, Math.ceil((startOfDay(b) - startOfDay(a)) / 86400000));

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

const statusChip = {
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300",
  "IN PROGRESS": "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
  "NOT STARTED": "bg-rose-100 text-rose-700 ring-1 ring-rose-300",
  CANCELLED: "bg-[#FDE7E7] text-[#7A1F1F] ring-1 ring-[#F1BDBD]",
};

const headers = [
  { k: "statusLabel", label: "Status", align: "left", w: "w-44" },
  { k: "jobNo", label: "Job Number" },
  { k: "cust", label: "Customer/ Client" },
  { k: "projectName", label: "Project Name" },
  { k: "desc", label: "Scope of Work" },
  { k: "contractType", label: "Contract Type" },
  { k: "startDate", label: "Start Date" },
  { k: "endDate", label: "Finish Date" },
  { k: "contractDuration", label: "Contract Duration", align: "right" },
  { k: "actualDuration", label: "Actual Duration", align: "right" },
  { k: "remainingDuration", label: "Remaining Duration", align: "right" },
  { k: "addDuration", label: "Add Duration", align: "right" },
];

/* ========== Page ========== */
export default function ProjectMonitoring() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const containerRef = useRef(null);
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Hitung durasi + overall */
  const { rows, overall } = useMemo(() => {
    const today = new Date();
    const mapped = projects.map((r) => {
      const s = parseFlexibleDate(r.startDate);
      const e = parseFlexibleDate(r.endDate);
      const label = normalizeStatus(r.status);

      const contractDuration = s && e ? daysBetween(s, e) : 0;

      let actualDuration = 0, remainingDuration = 0;
      if (label === "COMPLETED" && s && e) {
        actualDuration = daysBetween(s, e);
      } else if (label === "IN PROGRESS" && s) {
        actualDuration = daysBetween(s, today);
        remainingDuration = e ? Math.max(0, daysBetween(today, e)) : 0;
      } else if (label === "NOT STARTED") {
        remainingDuration = e ? Math.max(0, daysBetween(today, e)) : 0;
      }

      return {
        ...r,
        statusLabel: label,
        contractDuration,
        actualDuration,
        remainingDuration,
        addDuration: r.addDuration || 0,
        startDateFmt: s ? s.toISOString() : null,
        endDateFmt: e ? e.toISOString() : null,
      };
    });

    const total = mapped.length;
    const completed = mapped.filter((m) => m.statusLabel === "COMPLETED").length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    return { rows: mapped, overall: { completed, total, percent } };
  }, [projects]);

  /* Slide setup */
  const itemsPerTableSlide = 10;
  const itemsPerChartSlide = 5;

  const tableSlides = Math.max(1, Math.ceil(rows.length / itemsPerTableSlide));
  const chartSlides = Math.max(1, Math.ceil(rows.length / itemsPerChartSlide));
  const allSlides = tableSlides + chartSlides;
  const isChartSlide = slide >= tableSlides;

  // autoplay (+ pause on hover)
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % allSlides), 10000);
    return () => clearInterval(id);
  }, [allSlides]);

  useEffect(() => {
    if (slide > allSlides - 1) setSlide(0);
  }, [allSlides, slide]);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setSlide((s) => (s - 1 + allSlides) % allSlides);
      if (e.key === "ArrowRight") setSlide((s) => (s + 1) % allSlides);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allSlides]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal fetch");
        const raw = await res.json();

        // mapping sesuai DB schema kamu
        const mapped = raw.map((p) => ({
          id: Number(p.id),
          jobNo: p.jobNo,
          cust: p.customer,
          projectName: p.projectName,
          desc: p.description,
          startDate: p.startDate,
          endDate: p.endDate,
          status: p.status,
          PIC: p.pic,
          contract_type: p.contract_type,
          addDuration: p.add_duration,
        }));
        setProjects(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pagedRows = useMemo(() => {
    if (isChartSlide) return [];
    const start = slide * itemsPerTableSlide;
    return rows.slice(start, start + itemsPerTableSlide);
  }, [rows, slide, isChartSlide]);

  const chartPageIndex = Math.max(0, slide - tableSlides);
  const chartItems = useMemo(() => {
    if (!isChartSlide) return [];
    const start = chartPageIndex * itemsPerChartSlide;
    return rows.slice(start, start + itemsPerChartSlide);
  }, [rows, isChartSlide, chartPageIndex]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) { setRole(null); return; }
        const data = await res.json();
        setRole(data?.user?.role ?? null);
      } catch {
        setRole(null);
      }
    })();
  }, []);

  const fmtDMY = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        await Swal.fire({
          title: "Berhasil",
          text: "Sebentar Lagi Anda Di kembalikan ke Halaman Login.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        router.replace("/Login");
      } catch (err) {
        console.error("Logout failed", err);
        Swal.fire("Error", "Logout gagal, coba lagi.", "error");
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-white ${poppins.className}`}>
      {/* NAVBAR */}
      <nav className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
        {/* SIDEBAR (komponen) */}
        <Sidebar
          open={sidebarOpen}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          role={role}
        />

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* toggles */}
        <button className="md:hidden p-2" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>
        <button className="hidden md:block p-2 cursor-pointer" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">🌿 Admin Dashboard</h1>

        {/* kanan */}
        <div className="flex items-center gap-4">
          {role === "user" && (
            <Link
              href="/admin/profile"
              className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              title="Profile"
              aria-label="Profile"
            >
              <FaUser className="cursor-pointer" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Logout"
          >
            <FaSignOutAlt className="cursor-pointer" />
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1">
        <div
          ref={containerRef}
          className="mx-auto w-full max-w-[2560px] bg-[#F0EDE4] backdrop-blur rounded-2xl border border-emerald-100 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)] overflow-hidden"
        >
          {/* Top bar with title */}
          <div className="relative">
            <div className="flex items-start justify-between gap-4 px-5 md:px-8 lg:px-10 pt-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-gray-800">
                CESCO PROJECT MONITORING
              </h2>
              <Image src="/logo.png" alt="Company Logo" width={300} height={300} priority />
            </div>

            {/* progress bar (6s) */}
            <div className="mt-4 h-1 w-full bg-gray-100">
              <div
                key={slide} // reset animation each slide
                className={`h-1 bg-emerald-500 transition-[width] duration-[6000ms] ease-linear`}
                style={{ willChange: "width" }}
              />
            </div>
          </div>

          {/* Meta & Overall */}
          <div className="px-5 md:px-8 lg:px-10 pb-6">
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-[180px_1fr] gap-3">
                <div className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">PROJECT MANAGER</div>
                <div className="bg-gray-50 rounded-md border border-gray-200 px-3 py-2 text-gray-800">Alex B.</div>
                <div className="text-sm sm:text-base font-semibold text-gray-700 flex items-center">PROJECT GM</div>
                <div className="bg-gray-50 rounded-md border border-gray-200 px-3 py-2 text-gray-800">Alex B.</div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-gradient-to-b from-white to-emerald-50">
                <div className="grid grid-cols-[1fr_120px]">
                  <div className="px-3 py-2 text-sm font-semibold text-emerald-800 border-b border-emerald-200">
                    OVERALL PROGRESS
                  </div>
                  <div className="row-span-2 flex items-center justify-center">
                    <div className="text-3xl font-extrabold text-emerald-700">{overall.percent}%</div>
                  </div>
                  <div className="px-3 pb-3 pt-2">
                    <div className="h-2 bg-emerald-100 rounded">
                      <div className="h-2 rounded bg-emerald-600" style={{ width: `${overall.percent}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {overall.completed} of {overall.total} completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide controls */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-3 py-2 rounded-full border text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                onClick={() => setSlide((s) => (s - 1 + allSlides) % allSlides)}
                aria-label="Prev slide"
              >
                <FaArrowLeft />
              </button>
              <span className="text-sm text-gray-600">
                Slide {slide + 1} / {allSlides}
              </span>
              <button
                className="px-3 py-2 rounded-full border text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                onClick={() => setSlide((s) => (s + 1) % allSlides)}
                aria-label="Next slide"
              >
                <FaArrowRight />
              </button>
            </div>

            {/* Slide area (fade) */}
            <div key={slide} className="mt-4 rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-opacity duration-700 opacity-100">
              {!isChartSlide ? (
                <div className="w-full h-[680px] overflow-x-auto">
                  <table className="w-full min-w-[1200px] h-170 border-collapse">
                    <thead className="bg-gray-50">
                      <tr className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-700">
                        {headers.map((h) => (
                          <th
                            key={h.k}
                            className={`border border-gray-200 px-2 py-3 ${h.align === "right" ? "text-right" : "text-left"} ${h.w || ""}`}
                          >
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800 bg-white">
                      {pagedRows.map((r, idx) => (
                        <tr
                          key={r.id}
                          className={`transition hover:bg-emerald-50/60 ${idx % 2 ? "bg-white" : "bg-gray-50/40"}`}
                        >
                          <td className="border border-gray-200 p-0">
                            <div className={`px-3 py-2 rounded-none ${statusChip[r.statusLabel] || statusChip["NOT STARTED"]} flex items-center gap-2`}>
                              <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70"></span>
                              <span className="font-semibold uppercase tracking-wide text-xs sm:text-sm">{r.statusLabel}</span>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-3 py-2">{r.jobNo}</td>
                          <td className="border border-gray-200 px-3 py-2">{r.cust}</td>
                          <td className="border border-gray-200 px-3 py-2">{r.projectName}</td>
                          <td className="border border-gray-200 px-3 py-2">{r.desc}</td>
                          <td className="border border-gray-200 px-3 py-2">{r.contract_type || "LUMPSUM"}</td>
                          <td className="border border-gray-200 px-3 py-2">{fmtDMY(r.startDateFmt)}</td>
                          <td className="border border-gray-200 px-3 py-2">{fmtDMY(r.endDateFmt)}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{r.contractDuration}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{r.actualDuration}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{r.remainingDuration}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right">{r.addDuration}</td>
                        </tr>
                      ))}
                      {pagedRows.length === 0 && (
                        <tr>
                          <td className="border border-gray-200 px-3 py-10 text-center text-gray-500" colSpan={headers.length}>
                            No data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <BarChart items={chartItems} page={chartPageIndex + 1} pages={chartSlides} />
              )}
            </div>

            {/* Page info */}
            <div className="mt-3 text-center text-sm text-gray-600">Slide {slide + 1} / {allSlides}</div>

            {/* Marquee */}
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                display: inline-block;
                min-width: 100%;
                animation: marquee 15s linear infinite;
              }
            `}</style>

            <div className="mt-6 w-full overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-2xl font-bold text-emerald-700">
                🚀 Welcome to CESCO Project Monitoring — Keep track of all projects in real-time |
                Completed: {overall.completed} | Total: {overall.total} | Progress: {overall.percent}% 🚀
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
