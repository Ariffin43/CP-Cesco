"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaPlus, FaEdit, FaTrash, FaFilePdf, FaFileWord, FaFileExcel, FaFileImport,
  FaBars, FaHome, FaTable, FaUser, FaSignOutAlt, FaChevronDown,
  FaArrowRight, FaArrowLeft, FaSearch
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ========================= Helpers ========================= */
const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const fmtISO = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

const parseFlexibleDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim().replace(/\//g, "-");
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const y = Number(ymd[1]), m = Number(ymd[2]) - 1, d = Number(ymd[3]);
    return new Date(Date.UTC(y, m, d));
  }
  const dmy = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const d = Number(dmy[1]), m = Number(dmy[2]) - 1, y = Number(dmy[3]);
    return new Date(Date.UTC(y, m, d));
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const toISOInput = (val) => {
  const d = parseFlexibleDate(val);
  return d ? fmtISO(d) : "";
};

const daysBetween = (a, b) => Math.max(0, Math.ceil((startOfDay(b) - startOfDay(a)) / 86400000));

const computeDurations = (startDate, endDate, status) => {
  const s = parseFlexibleDate(startDate);
  const e = parseFlexibleDate(endDate);
  const st = String(status || "").trim().toLowerCase();
  if (st === "finish" || st === "cancel") return { ongoing: "-", remaining: "-" };
  if (!s || !e || e < s) return { ongoing: "-", remaining: "-" };
  const today = new Date();
  const ongoing = Math.max(0, daysBetween(s, today));
  const remaining = Math.max(0, daysBetween(today, e));
  return { ongoing, remaining };
};

const StatusBadge = ({ status }) => {
  const cls = {
    Pending: "bg-yellow-50 text-yellow-700 ring-yellow-200/70",
    Ongoing: "bg-blue-50 text-blue-700 ring-blue-200/70",
    Finish:  "bg-green-50 text-green-700 ring-green-200/70",
    Cancel:  "bg-red-50 text-red-700 ring-red-200/70",
  }[status] || "bg-gray-50 text-gray-700 ring-gray-200/70";
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ${cls}`}>
      {status}
    </span>
  );
};

const REQUIRED_HEADERS = [
  "N", "DATE NO", "JOB NO", "CUSTOMER / CLIENT",
  "PROJECT NAME", "DESCRIPTION OF JOB", "START DATE", "FINISH DATE", "STATUS"
];

const HEADER_ALIASES = {
  "N": ["N", "NO", "No", "N°"],
  "DATE NO": ["DATE NO", "DATE", "DATE NO.", "DATE NUMBER", "DATE#"],
  "JOB NO": ["JOB NO", "JOB", "JOB NO.", "JOB NUMBER", "JOB#"],
  "CUSTOMER / CLIENT": ["CUSTOMER / CLIENT", "CUSTOMER", "CLIENT", "CUSTOMER/CLIENT"],
  "PROJECT NAME": ["PROJECT NAME", "PROJECT", "PROJECT TITLE", "PROJECTNAME"],
  "DESCRIPTION OF JOB": ["DESCRIPTION OF JOB", "DESCRIPTION", "JOB DESCRIPTION", "DESC"],
  "START DATE": ["START DATE", "START", "STARTDAY", "START-DATE"],
  "FINISH DATE": ["FINISH DATE", "END DATE", "FINISH", "END"],
  "STATUS": ["STATUS", "STATE"],
  "PIC": ["PIC", "PERSON IN CHARGE", "P.I.C"],
  "CONTRACT TYPE": ["CONTRACT TYPE", "CONTRACT", "CONTRACTTYPE", "TYPE OF CONTRACT"],
  "ADD DURATION": ["ADD DURATION", "EXTENSION", "DAYS EXTENDED", "ADD_DURATION", "ADDITIONAL DURATION"],
};

const findIndexByAliases = (headerRow, key) => {
  const lower = headerRow.map((h) => String(h || "").trim().toLowerCase());
  for (const aliasRaw of (HEADER_ALIASES[key] || [])) {
    const alias = aliasRaw.toLowerCase();
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
};

const EMPTY_FORM = {
  id: null,
  jobNo: "",
  cust: "",
  projectName: "",
  desc: "",
  startDate: "",
  endDate: "",
  status: "Pending",
  contractType: "",
  PIC: "",
  addDuration: null,
};

const pickHeaderRow = (rows) => {
  let bestIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    const score = REQUIRED_HEADERS.reduce((sum, key) => sum + (findIndexByAliases(row, key) !== -1 ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  if (bestIdx === -1 || bestScore < 5) {
    throw new Error("Header tidak ditemukan. Pakai template & jangan hapus nama kolom.");
  }
  const headerRow = rows[bestIdx].map((h) => String(h || "").trim());
  const bodyRows  = rows.slice(bestIdx + 1);
  return { headerRow, bodyRows };
};

function excelDateToISO(serial) {
  if (typeof serial !== "number") return serial || "";
  const utcDays = Math.floor(serial - 25569);
  const dateInfo = new Date(utcDays * 86400 * 1000);
  return fmtISO(new Date(Date.UTC(
    dateInfo.getUTCFullYear(),
    dateInfo.getUTCMonth(),
    dateInfo.getUTCDate()
  )));
}

const fmtHuman = (val) => {
  const d = parseFlexibleDate(val);
  return d
    ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";
};

const Pagination = (totalPages, currentPage1Based, siblingCount = 1, boundaryCount = 1) => {
  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  const range = (start, end) => Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  if (totalPages <= totalPageNumbers) return range(1, totalPages);

  const leftSibling  = Math.max(currentPage1Based - siblingCount, boundaryCount + 2);
  const rightSibling = Math.min(currentPage1Based + siblingCount, totalPages - boundaryCount - 1);

  const showLeftEllipsis  = leftSibling > boundaryCount + 2;
  const showRightEllipsis = rightSibling < totalPages - boundaryCount - 1;

  const startPages = range(1, boundaryCount);
  const endPages   = range(totalPages - boundaryCount + 1, totalPages);
  const middlePages = range(leftSibling, rightSibling);

  const pages = [
    ...startPages,
    showLeftEllipsis ? "left-ellipsis" : range(boundaryCount + 1, leftSibling - 1),
    ...middlePages,
    showRightEllipsis ? "right-ellipsis" : range(rightSibling + 1, totalPages - boundaryCount),
    ...endPages,
  ].flat();

  return pages;
};

/* ========================= Page ========================= */
export default function Projects() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  // Data (from DB)
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FILTER
  const STATUS_OPTIONS = ["All", "Pending", "Ongoing", "Finish", "Cancel"];
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");

  // pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);

  // selection (bulk delete)
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Form
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const exportRef = useRef(null);
  const modalRef = useRef(null);

  // Import state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState([]);

  /* ---------- Auth role ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) { setRole(null); return; }
        const data = await res.json();
        setRole(data?.user?.role ?? null);
      } catch { setRole(null); }
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter, q]);

  /* ---------- Loader DB ---------- */
  const mapFromApi = (p) => ({
    id: Number(p.id),
    jobNo: p.jobNo,
    cust: p.customer,
    projectName: p.projectName,
    desc: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    status: p.status,
    PIC: p.pic,
    contractType: p.contract_type ?? "",
    addDuration: p.add_duration ?? null,
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const mapped = raw.map(mapFromApi);

      setProjects(mapped);

      setSelectedIds((prev) => {
        const valid = new Set(mapped.map((p) => p.id));
        const next = new Set([...prev].filter((id) => valid.has(id)));
        return next;
      });
    } catch (e) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  /* ---------- Outside click close ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
      if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData(EMPTY_FORM);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  /* ---------- Logout ---------- */
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
    if (!result.isConfirmed) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await Swal.fire({
        title: "Berhasil",
        text: "Sebentar lagi Anda dikembalikan ke halaman Login.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      router.replace("/Login");
    } catch (err) {
      console.error("Logout failed", err);
      Swal.fire("Error", "Logout gagal, coba lagi.", "error");
    }
  };

  /* ---------- Single Delete ---------- */
  const confirmDelete = async (id) => {
    const res = await Swal.fire({
      title: "Hapus data?",
      text: "Aksi ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;

    try {
      const r = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Gagal menghapus");
      await loadProjects();
      Swal.fire({ icon: "success", title: "Terhapus", timer: 1200, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message || "Gagal hapus" });
    }
  };

  /* ---------- Bulk Delete (per halaman) ---------- */
  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const res = await Swal.fire({
      title: `Hapus ${selectedIds.size} data terpilih?`,
      text: "Aksi ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus semua",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;

    try {
      // hapus satu per satu (aman dengan API sekarang)
      for (const id of selectedIds) {
        const r = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!r.ok) throw new Error(`Gagal hapus id=${id}`);
      }
      await loadProjects();
      Swal.fire({ icon: "success", title: "Terhapus", text: "Data terpilih berhasil dihapus.", timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message || "Sebagian gagal dihapus." });
    }
  };

  /* ---------- Export ---------- */
  const exportPDF = () => {
    window.print();
    Swal.fire({ icon: "success", title: "Mengekspor ke PDF...", timer: 1000, showConfirmButton: false });
  };

  const exportExcel = () => {
    const title = "SUMMARY OF PROJECT DOCUMENT";
    const headers = [
      "N", "DATE NO", "JOB NO", "CUSTOMER / CLIENT",
      "PROJECT NAME", "DESCRIPTION OF JOB", "START DATE", "FINISH DATE", "STATUS"
    ];

    const rows = projects.map((p, i) => ([
      i + 1, "", p.jobNo, p.cust, p.projectName, p.desc,
      fmtHuman(p.startDate), fmtHuman(p.endDate), String(p.status || "").toUpperCase()
    ]));

    const aoa = [[title], [], headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
    ws["!cols"] = [
      { wch: 4 }, { wch: 12 }, { wch: 12 }, { wch: 34 }, { wch: 28 },
      { wch: 42 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
    ];
    const lastRow = 3 + rows.length;
    ws["!autofilter"] = { ref: `A3:I${Math.max(3, lastRow)}` };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "SUMMARY_OF_PROJECT_DOCUMENT.xlsx");

    Swal.fire({ icon: "success", title: "Excel diekspor", timer: 1200, showConfirmButton: false });
  };

  const exportWord = () => {
    const lines = projects.map((p, i) =>
      `${i + 1}. ${p.jobNo} | ${p.cust} | ${p.projectName} | ${p.desc} | ${toISOInput(p.startDate)} → ${toISOInput(p.endDate)} | ${p.status} | ${p.PIC}`
    );
    const blob = new Blob([lines.join("\n")], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projects.doc";
    link.click();
    Swal.fire({ icon: "success", title: "Word diekspor", timer: 1200, showConfirmButton: false });
  };

  /* ---------- Import ---------- */
  const handleFileUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        if (!wb.SheetNames?.length) throw new Error("File tidak ada isinya!");
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

        const nonEmptyRows = (data || []).filter(
          (row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
        );
        if (!nonEmptyRows.length) throw new Error("File tidak ada isinya!");

        const { headerRow, bodyRows } = pickHeaderRow(nonEmptyRows);

        const missing = REQUIRED_HEADERS.filter((h) => findIndexByAliases(headerRow, h) === -1);
        if (missing.length) throw new Error(`Header wajib hilang: ${missing.join(", ")}`);

        if (!bodyRows.length) throw new Error("Tidak ada baris data pada file (hanya header).");

        const idxStart  = findIndexByAliases(headerRow, "START DATE");
        const idxFinish = findIndexByAliases(headerRow, "FINISH DATE");
        const idxDateNo = findIndexByAliases(headerRow, "DATE NO");

        const converted = [headerRow, ...bodyRows.map((row) => {
          const r = [...row];
          if (idxStart  >= 0 && typeof r[idxStart]  === "number") r[idxStart]  = excelDateToISO(r[idxStart]);
          if (idxFinish >= 0 && typeof r[idxFinish] === "number") r[idxFinish] = excelDateToISO(r[idxFinish]);
          if (idxDateNo >= 0 && typeof r[idxDateNo] === "number") r[idxDateNo] = excelDateToISO(r[idxDateNo]);
          return r;
        })];

        setPreviewData(converted);
        setUploading(false);
        setUploadProgress(100);
        Swal.fire({ icon: "success", title: "File terbaca", timer: 900, showConfirmButton: false });
      } catch (err) {
        setUploading(false);
        setUploadProgress(0);
        setPreviewData([]);
        setFileName("");
        Swal.fire({ icon: "error", title: "Gagal Import", text: err.message || "Terjadi kesalahan membaca file." });
      }
    };
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
    };
    reader.readAsBinaryString(file);
  };

  function normalizeStatus(s) {
    const t = String(s || "").trim().toLowerCase();
    if (t === "finish" || t === "finished" || t === "completed") return "Finish";
    if (t === "ongoing" || t === "in progress" || t === "progress") return "Ongoing";
    if (t === "cancel" || t === "cancelled" || t === "canceled") return "Cancel";
    return "Pending";
  }

  const handleImport = () => {
    if (!previewData.length) {
      Swal.fire({ icon: "error", title: "Gagal Import", text: "File tidak ada isinya!" });
      return;
    }
    const header = previewData[0].map((h) => String(h).trim());
    const rows = previewData.slice(1);
    if (!rows.length) {
      Swal.fire({ icon: "error", title: "Gagal Import", text: "Tidak ada baris data pada file." });
      return;
    }

    const iJobNo  = findIndexByAliases(header, "JOB NO");
    const iCust   = findIndexByAliases(header, "CUSTOMER / CLIENT");
    const iPName  = findIndexByAliases(header, "PROJECT NAME");
    const iDesc   = findIndexByAliases(header, "DESCRIPTION OF JOB");
    const iStart  = findIndexByAliases(header, "START DATE");
    const iFinish = findIndexByAliases(header, "FINISH DATE");
    const iStatus = findIndexByAliases(header, "STATUS");
    const iPIC    = findIndexByAliases(header, "PIC");

    const imported = rows
      .map((row) => {
        const hasAny = row?.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
        if (!hasAny) return null;
        return {
          jobNo: String(row[iJobNo] ?? "").trim(),
          customer: String(row[iCust] ?? "").trim(),
          projectName: String(row[iPName] ?? "").trim(),
          description: String(row[iDesc] ?? "").trim(),
          startDate: row[iStart]  ? toISOInput(row[iStart])  : "",
          endDate:   row[iFinish] ? toISOInput(row[iFinish]) : "",
          status: normalizeStatus(row[iStatus]),
          pic: row[iPIC] && String(row[iPIC]).trim() !== "" ? String(row[iPIC]).trim() : "-",
        };
      })
      .filter(Boolean);

    (async () => {
      try {
        if (!imported.length) throw new Error("Semua baris kosong.");
        for (const payload of imported) {
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(`Gagal import pada "${payload.jobNo}" (${res.status}) ${msg}`);
          }
        }
        await loadProjects();
        setIsImportModalOpen(false);
        setPreviewData([]);
        setUploading(false);
        setUploadProgress(0);
        setFileName("");
        Swal.fire({ icon: "success", title: "Import berhasil", text: `${imported.length} baris ditambahkan.`, timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Gagal Import", text: err.message || "Terjadi kesalahan." });
      }
    })();
  };

  /* ---------- Derived: filtered + paginated ---------- */
  const filtered = useMemo(() => {
    const norm = (s) => String(s || "").toLowerCase();

    let list = projects;
    if (statusFilter !== "All") list = list.filter((p) => p.status === statusFilter);

    const raw = q.trim().toLowerCase();
    if (!raw) return list;

    // dukung sintaks: job:<text> dan cust:<text>
    const tokens = raw.split(/\s+/);
    const jobFilters  = tokens.filter(t => t.startsWith("job:")).map(t => t.slice(4));
    const custFilters = tokens.filter(t => t.startsWith("cust:")).map(t => t.slice(5));
    const plainTokens = tokens.filter(t => !t.startsWith("job:") && !t.startsWith("cust:"));

    const match = (p) => {
      const job  = norm(p.jobNo);
      const cust = norm(p.cust);

      // semua job: harus match di jobNo (AND)
      const jobOk  = jobFilters.every(t => job.includes(t));
      // semua cust: harus match di cust (AND)
      const custOk = custFilters.every(t => cust.includes(t));

      // setiap plain token boleh match di jobNo ATAU cust (AND antar token, OR antar kolom)
      const plainOk = plainTokens.every(t => job.includes(t) || cust.includes(t));

      return jobOk && custOk && plainOk;
    };

    return list.filter(match);
  }, [projects, statusFilter, q]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentPageSafe = Math.min(currentPage, Math.max(0, totalPages - 1));
  const startIndex = currentPageSafe * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const pageAllChecked = currentData.length > 0 && currentData.every((p) => selectedIds.has(p.id));
  const pageIndeterminate = currentData.some((p) => selectedIds.has(p.id)) && !pageAllChecked;

  const toggleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    if (pageAllChecked) {
      currentData.forEach((p) => next.delete(p.id));
    } else {
      currentData.forEach((p) => next.add(p.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  /* ========================= UI ========================= */
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* NAVBAR */}
      <nav className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
        <Sidebar
          open={sidebarOpen}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          role={role}
        />
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />}

        <button className="md:hidden p-2" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>
        <button className="hidden md:block p-2 cursor-pointer" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">🌿 Admin Dashboard</h1>

        <div className="flex items-center gap-4">
          <FaUser className="hidden sm:block" />
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

      {/* LAYOUT */}
      <div className="flex flex-1">
        {/* MAIN */}
        <main className="flex-1 p-2 md:p-3 lg:p-4 overflow-x-auto flex flex-col">
          <div className="max-w-[3840px] mx-auto w-full">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 text-black">
              {/* Filter status */}
              <div className="flex flex-wrap items-center gap-2">
                {["All","Pending","Ongoing","Finish","Cancel"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setCurrentPage(0); }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
                      statusFilter === s
                        ? "bg-emerald-600 text-white border-emerald-600 shadow"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {statusFilter !== "All" && (
                  <button
                    onClick={() => setStatusFilter("All")}
                    className="ml-1 text-sm text-red-600 underline hover:text-red-800 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <span className="text-xs text-gray-500 ml-1">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Search bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder='Search by job/customer (example: "PT-C166 McDERMOTT" or "job:PT-C1 cust:mcdermott")'
                    className="pl-10 pr-3 py-2 w-[300px] rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Export / Import / Tambah */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                  >
                    Export <FaChevronDown />
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 cursor-pointer">
                        <FaFilePdf className="text-red-600" /> PDF
                      </button>
                      <button onClick={exportWord} className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 cursor-pointer">
                        <FaFileWord className="text-blue-600" /> Word
                      </button>
                      <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 cursor-pointer">
                        <FaFileExcel className="text-green-600" /> Excel
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                >
                  <FaFileImport /> Import Project
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(EMPTY_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                >
                  <FaPlus /> Add Project
                </button>
              </div>
            </div>

            {/* Bulk actions toolbar (muncul jika ada selection) */}
            {selectedIds.size > 0 && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-2 flex items-center justify-between">
                <div className="text-sm">
                  <strong>{selectedIds.size}</strong> dipilih
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 text-sm"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                  >
                    <FaTrash className="inline mr-1" /> Hapus Terpilih
                  </button>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
              <div className="w-full overflow-x-auto overflow-y-auto min-h-[100px]">
                <table className="w-full min-w-[1200px] table-fixed">
                  <thead className="text-xs sm:text-sm">
                    <tr className="text-white">
                      {/* header sticky + bg per-cell */}
                      <th className="px-2 py-3 text-center sticky top-0 z-30 bg-emerald-700 w-12">
                        <input
                          type="checkbox"
                          aria-label="Select all on page"
                          checked={pageAllChecked}
                          ref={(el) => { if (el) el.indeterminate = pageIndeterminate; }}
                          onChange={toggleSelectAllOnPage}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-3 text-center sticky top-0 z-30 bg-emerald-700 w-14">NO</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[110px]">Job No</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[280px]">Customer</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[240px]">Project Name</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[320px]">Description</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[140px]">Start Date</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[140px]">End Date</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[120px]">Ongoing</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[120px]">Remaining</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[100px]">Status</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[100px]">PIC</th>
                      <th className="px-3 py-3 text-left sticky top-0 z-30 bg-emerald-700 w-[100px]">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                    {loading && (
                      <tr>
                        <td colSpan={13} className="px-3 py-10 text-center text-gray-500">Memuat…</td>
                      </tr>
                    )}

                    {!loading && currentData.map((p, idx) => {
                      const d = computeDurations(p.startDate, p.endDate, p.status);
                      const checked = selectedIds.has(p.id);
                      return (
                        <tr key={p.id} className={`transition ${checked ? "bg-emerald-50/80" : "hover:bg-emerald-50/60"}`}>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-emerald-600 cursor-pointer"
                              checked={checked}
                              onChange={() => toggleSelectOne(p.id)}
                              aria-label={`select ${p.jobNo}`}
                            />
                          </td>
                          <td className="px-3 py-3 text-center">{startIndex + idx + 1}</td>
                          <td className="px-3 py-3 font-medium truncate" title={p.jobNo}>{p.jobNo}</td>
                          <td className="px-3 py-3 truncate" title={p.cust}>{p.cust}</td>
                          <td className="px-3 py-3 truncate" title={p.projectName}>{p.projectName}</td>
                          <td className="px-3 py-3 truncate" title={p.desc}>{p.desc}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{toISOInput(p.startDate)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{toISOInput(p.endDate)}</td>
                          <td className="px-3 py-3">{d.ongoing === "-" ? "-" : `${d.ongoing} d`}</td>
                          <td className="px-3 py-3">{d.remaining === "-" ? "-" : `${d.remaining} d`}</td>
                          <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-3 py-3 truncate" title={p.PIC}>{p.PIC}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setFormData({
                                    id: p.id,
                                    jobNo: p.jobNo,
                                    cust: p.cust,
                                    projectName: p.projectName,
                                    desc: p.desc,
                                    startDate: toISOInput(p.startDate),
                                    endDate: toISOInput(p.endDate),
                                    status: p.status,
                                    PIC: p.PIC,
                                    contractType: p.contractType ?? "LUMPSUM",
                                    addDuration: (p.addDuration ?? null),
                                  });
                                  setIsEditing(true);
                                  setIsModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                aria-label="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => confirmDelete(p.id)}
                                className="text-red-600 hover:text-red-800"
                                aria-label="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!loading && currentData.length === 0 && (
                      <tr>
                        <td colSpan={13} className="px-3 py-10 text-center text-gray-500">
                          {projects.length === 0 ? "Tidak ada data projek." : "Tidak ada data untuk filter ini."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="fixed left-0 right-0 bottom-6 flex justify-center z-30">
              <div className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-full border border-gray-200">
                <button
                  className={`p-2 rounded-full ${currentPageSafe === 0 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPageSafe === 0}
                  aria-label="Prev"
                >
                  <FaArrowLeft />
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Pagination(totalPages, currentPageSafe + 1, 1, 1).map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={`p-${p}-${idx}`}
                        onClick={() => setCurrentPage(p - 1)}
                        className={`w-8 h-8 rounded-full text-sm ${currentPageSafe === p - 1 ? "bg-emerald-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        aria-label={`Halaman ${p}`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={`e-${p}-${idx}`} className="px-1 text-gray-500 select-none">…</span>
                    )
                  )}
                </div>

                <span className="sm:hidden text-sm text-gray-700 px-2">
                  {currentPageSafe + 1} / {totalPages}
                </span>

                <button
                  className={`p-2 rounded-full ${currentPageSafe === totalPages - 1 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPageSafe === totalPages - 1}
                  aria-label="Next"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative text-black">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Project" : "Add Project"}</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const s = parseFlexibleDate(formData.startDate);
                const eD = parseFlexibleDate(formData.endDate);
                if (!s || !eD) {
                  Swal.fire({ icon: "error", title: "Tanggal tidak valid", text: "Use YYYY-MM-DD atau DD-MM-YYYY." });
                  return;
                }
                if (eD < s) {
                  Swal.fire({ icon: "error", title: "Validasi", text: "End Date harus setelah/sama dengan Start Date." });
                  return;
                }

                // kirim add_duration apa adanya; biar trigger DB yang geser end_date (hanya relevan saat edit)
                const addDurRaw = formData.addDuration;
                const addDur = (addDurRaw === "" || addDurRaw === null) ? null : Number(addDurRaw);
                if (addDur !== null && (!Number.isFinite(addDur) || addDur < 0)) {
                  Swal.fire({ icon: "error", title: "Validasi", text: "Add Duration harus angka ≥ 0 atau kosong." });
                  return;
                }

                const payload = {
                  jobNo: formData.jobNo.trim(),
                  customer: formData.cust.trim(),
                  projectName: formData.projectName.trim(),
                  description: formData.desc.trim(),
                  startDate: fmtISO(s),
                  endDate: fmtISO(eD),
                  status: formData.status,
                  pic: formData.PIC.trim(),
                  contract_type: formData.contractType || null,
                  add_duration: addDur ?? null,
                };

                try {
                  if (isEditing) {
                    const res = await fetch(`/api/projects/${formData.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Update gagal");
                  } else {
                    const res = await fetch(`/api/projects`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Tambah gagal");
                  }

                  await loadProjects();
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setFormData(EMPTY_FORM);

                  await Swal.fire({
                    icon: "success",
                    title: isEditing ? "Berhasil diupdate" : "Berhasil ditambahkan",
                    timer: 1200,
                    showConfirmButton: false,
                  });
                } catch (err) {
                  Swal.fire({ icon: "error", title: "Error", text: err.message || "Gagal simpan." });
                }
              }}
              className="space-y-5"
            >
              {/* Row 1: Job No, Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job No</label>
                  <input
                    type="text"
                    value={formData.jobNo}
                    onChange={(e) => setFormData((s) => ({ ...s, jobNo: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="PT-Cxxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <input
                    type="text"
                    value={formData.cust}
                    onChange={(e) => setFormData((s) => ({ ...s, cust: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Customer Name"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Project Name (full) */}
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData((s) => ({ ...s, projectName: e.target.value }))}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Project Name"
                  required
                />
              </div>

              {/* Row 3: Description (full) */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.desc}
                  onChange={(e) => setFormData((s) => ({ ...s, desc: e.target.value }))}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Description"
                  rows={3}
                  required
                />
              </div>

              {/* Row 4: Status, Contract Type, PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((s) => ({ ...s, status: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Finish">Finish</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contract Type</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData((s) => ({ ...s, contractType: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="LUMPSUM">LUMPSUM</option>
                    <option value="DAILY_RATE">DAILY RATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PIC</label>
                  <input
                    type="text"
                    value={formData.PIC}
                    onChange={(e) => setFormData((s) => ({ ...s, PIC: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="PIC Name"
                    required
                  />
                </div>
              </div>

              {/* Row 5: Start Date, End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((s) => ({ ...s, startDate: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((s) => ({ ...s, endDate: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Row 6 (KHUSUS EDIT): Add Duration */}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Add Duration (days)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={formData.addDuration ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === "" ? null : Number(raw);
                        setFormData((s) => ({ ...s, addDuration: Number.isFinite(n) ? n : null }));
                      }}
                      className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. 0, 7, 14..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada penambahan durasi.</p>
                  </div>
                  <div className="hidden sm:block" />
                  <div className="hidden sm:block" />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setFormData(EMPTY_FORM);
                  }}
                  className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition">
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 text-gray-900 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📥 Import</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-red-500 cursor-pointer">✕</button>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload({ target: { files: [file] } });
              }}
            >
              <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" id="fileUpload" />
              {!fileName ? (
                <>
                  <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 font-medium hover:underline">
                    Drag & Drop or click for upload
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Support File : XLSX</p>
                </>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-xl">📊</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                      <div className="w-full bg-gray-200 h-2 rounded mt-1">
                        <div className="bg-blue-500 h-2 rounded transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => { setFileName(""); setPreviewData([]); setUploadProgress(0); setUploading(false); }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 ml-3">{uploadProgress}%</span>
                </div>
              )}
            </div>

            {previewData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">🔍 Import Preview</h3>
                <div className="border rounded-lg overflow-auto max-h-60">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>{previewData[0].map((col, i) => (<th key={i} className="p-2 border text-left font-medium">{col}</th>))}</tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1, 6).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {row.map((cell, j) => (<td key={j} className="p-2 border">{String(cell ?? "")}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-1">Show 5 first rows...</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  const title = "SUMMARY OF PROJECT DOCUMENT";
                  const headers = [
                    "N", "DATE NO", "JOB NO", "CUSTOMER / CLIENT",
                    "PROJECT NAME", "DESCRIPTION OF JOB", "START DATE", "FINISH DATE", "STATUS"
                  ];
                  const sample = ["", "", "", "", "", "", "", "", ""];
                  const aoa = [[title], [], headers, sample];
                  const ws = XLSX.utils.aoa_to_sheet(aoa);
                  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
                  ws["!cols"] = [
                    { wch: 4 }, { wch: 12 }, { wch: 12 }, { wch: 34 }, { wch: 28 },
                    { wch: 42 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
                  ];
                  ws["!autofilter"] = { ref: "A3:I3" };
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Template");
                  XLSX.writeFile(wb, "TEMPLATE_SUMMARY_OF_PROJECT_DOCUMENT.xlsx");
                  Swal.fire({ icon: "success", title: "Template diunduh", timer: 1000, showConfirmButton: false });
                }}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer"
              >
                Download Template
              </button>
              <button onClick={handleImport} disabled={previewData.length === 0} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (<div className="fixed inset-0 backdrop-brightness-30 bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />)}
    </div>
  );
}
