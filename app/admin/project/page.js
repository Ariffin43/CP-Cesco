"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaPlus, FaEdit, FaTrash, FaFilePdf, FaFileWord, FaFileExcel, FaFileImport,
  FaBars, FaHome, FaTable, FaUser, FaSignOutAlt, FaChevronDown,
  FaArrowRight, FaArrowLeft
} from "react-icons/fa";
import * as XLSX from "xlsx";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const fmtISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseFlexibleDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim().replace(/\//g, "-");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const toISOInput = (val) => {
  const d = parseFlexibleDate(val);
  return d ? fmtISO(d) : "";
};

const daysBetween = (a, b) => Math.max(0, Math.ceil((startOfDay(b) - startOfDay(a)) / 86400000));
const computeOngoingRemaining = (startDate, endDate) => {
  const s = parseFlexibleDate(startDate);
  const e = parseFlexibleDate(endDate);
  if (!s || !e || e < s) return { ongoing: 0, remaining: 0 };
  const today = new Date();
  return {
    ongoing: daysBetween(s, today),
    remaining: daysBetween(today, e),
  };
};

export default function Projects() {
    const pathname = usePathname();

    const [projects, setProjects] = useState([]);
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        email: "",
        role: "User",
        status: "Pending",
        startDate: "",
        endDate: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const exportRef = useRef(null);
    const modalRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        const handleClickOutside = (e) => {
        if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
        if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
            setIsModalOpen(false);
            setIsEditing(false);
            setFormData({
            id: null,
            name: "",
            email: "",
            role: "User",
            status: "Pending",
            startDate: "",
            endDate: "",
            });
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isModalOpen]);

    /* Dummy data */
    useEffect(() => {
        setProjects([
        { id: 1, name: "PT-001", status: "Pending", email: "john@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 2, name: "PT-002", status: "Ongoing", email: "jane@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 3, name: "PT-003", status: "Finish",  email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 4, name: "PT-004", status: "Ongoing", email: "sarah@example.com", role: "Staff",  startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 5, name: "PT-005", status: "Ongoing", email: "david@example.com", role: "Admin",  startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 6, name: "PT-006", status: "Finish",  email: "john@example.com", role: "Admin",   startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 7, name: "PT-007", status: "Finish",  email: "jane@example.com", role: "User",    startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 8, name: "PT-008", status: "Finish",  email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 9, name: "PT-009", status: "Ongoing", email: "sarah@example.com", role: "Staff",  startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 10, name: "PT-010", status: "Ongoing", email: "david@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 11, name: "PT-011", status: "Pending", email: "alfred@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 12, name: "PT-012", status: "Finish",  email: "bianca@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 13, name: "PT-013", status: "Ongoing", email: "charles@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 14, name: "PT-014", status: "Ongoing", email: "daniela@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 15, name: "PT-015", status: "Finish",  email: "edward@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 16, name: "PT-016", status: "Ongoing", email: "felix@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 17, name: "PT-017", status: "Ongoing", email: "gina@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 18, name: "PT-018", status: "Ongoing", email: "hadi@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 19, name: "PT-019", status: "Ongoing", email: "irma@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025" },
        { id: 20, name: "PT-020", status: "Ongoing", email: "joni@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025" },
        ]);
    }, []);

    const totalPages = Math.ceil(projects.length / itemsPerPage) || 1;
    const startIndex = currentPage * itemsPerPage;
    const currentData = projects.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = (id) => setProjects((prev) => prev.filter((p) => p.id !== id));

    const exportPDF = () => window.print();

    const exportExcel = () => {
        const header = ["No", "Name", "Status", "Email", "Role", "Start Date", "End Date", "Ongoing (Days)", "Remaining (Days)"];
        const rows = projects.map((p, i) => {
        const d = computeOngoingRemaining(p.startDate, p.endDate);
        return [i + 1, p.name, p.status, p.email, p.role, p.startDate, p.endDate, d.ongoing, d.remaining];
        });
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        ws["!cols"] = [{ wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Projects");
        XLSX.writeFile(wb, "projects.xlsx");
    };

    const exportWord = () => {
        const lines = projects.map((p, i) => `${i + 1}. ${p.name} | ${p.email} | ${p.role} | ${p.status} | ${p.startDate} → ${p.endDate}`);
        const blob = new Blob([lines.join("\n")], { type: "application/msword" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "projects.doc";
        link.click();
    };

    function excelDateToJSDate(serial) {
        if (typeof serial !== "number") return serial;
        const utc_days = Math.floor(serial - 25569);
        const date_info = new Date(utc_days * 86400 * 1000);
        return fmtISO(new Date(Date.UTC(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate())));
    }

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
            setFileName(file.name);
            setUploading(true);
            setUploadProgress(0);
            const reader = new FileReader();
            reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const converted = data.map((row, idx) =>
                idx === 0 ? row : row.map((cell, i) => (i === 5 || i === 6 ? excelDateToJSDate(cell) : cell))
        );
        setPreviewData(converted);
        setUploading(false);
        setUploadProgress(100);
        };
            reader.onprogress = (evt) => {
            if (evt.lengthComputable) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
            };
        reader.readAsBinaryString(file);
    };

    const handleImport = () => {
        if (previewData.length <= 1) return;
        const headers = previewData[0];
        const rows = previewData.slice(1);
        const imported = rows.map((row, idx) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i] ?? ""));
        return {
            id: Date.now() + idx,
            name: obj["Name"] || `PT-${idx + 1}`,
            status: obj["Status"] || "Pending",
            email: obj["Email"] || "",
            role: obj["Role"] || "User",
            startDate: obj["Start Date"] || "",
            endDate: obj["End Date"] || "",
        };
        });
        setProjects((prev) => [...prev, ...imported]);
        setIsImportModalOpen(false);
        setPreviewData([]);
        setUploading(false);
        setUploadProgress(0);
        setFileName("");
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([
        ["No", "Name", "Status", "Email", "Role", "Start Date", "End Date", "Ongoing", "Remaining"],
        ["", "", "", "", "", "", "", "", ""],
        ]);
        ws["!cols"] = [{ wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "template_import.xlsx");
    };

    const StatusBadge = ({ status }) => {
        const cls = {
            Pending: "bg-yellow-50 text-yellow-700 ring-yellow-200/70",
            Ongoing: "bg-blue-50 text-blue-700 ring-blue-200/70",
            Finish:  "bg-green-50 text-green-700 ring-green-200/70",
        }[status] || "bg-gray-50 text-gray-700 ring-gray-200/70";
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ${cls}`}>
            {status}
            </span>
        );
    };
    
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
        {/* NAVBAR */}
        <nav className="w-full bg-green-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
            <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}><FaBars size={22} /></button>
            <button className="hidden md:block p-2 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}><FaBars size={22} /></button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">🌿 Admin Dashboard</h1>
            <div className="flex items-center gap-4"><FaUser className="hidden sm:block" /><FaSignOutAlt className="cursor-pointer" /></div>
        </nav>

        {/* LAYOUT */}
        <div className="flex flex-1">
            {/* SIDEBAR */}
            <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed top-12 left-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 z-40`}>
                <ul className="space-y-4 p-6 text-gray-700 font-medium">
                    <li>
                    <Link
                        href="/admin/dashboard"
                        className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md ${pathname === "/admin/dashboard" ? "bg-green-100 text-green-700 font-semibold" : "hover:text-green-600"}`}
                    >
                        <FaHome /> Home
                    </Link>
                    </li>
                    <li>
                    <Link
                        href="/admin/project"
                        className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md ${pathname === "/admin/project" ? "bg-green-100 text-green-700 font-semibold" : "hover:text-green-600"}`}
                    >
                        <FaTable /> Projects
                    </Link>
                    </li>
                </ul>
            </aside>

            {/* MAIN */}
            <main className="flex-1 p-2 md:p-3 lg:p-4 overflow-x-auto flex flex-col">
                <div className="max-w-[3840px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3">
                        <div className="flex text-black flex-wrap items-center gap-3">
                            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6 gap-3">
                                {/* Export */}
                                <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setExportOpen(!exportOpen)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                                >
                                    Export <FaChevronDown />
                                </button>
                                {exportOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
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
                                <FaFileImport /> Import Projek
                                </button>

                                {/* Tambah Projek */}
                                <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                    id: null,
                                    name: "",
                                    email: "",
                                    role: "User",
                                    status: "Pending",
                                    startDate: "",
                                    endDate: "",
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                                >
                                <FaPlus /> Tambah Projek
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto rounded-2xl">
                            <table className="w-full min-w-[1100px] table-fixed">
                                <thead className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs sm:text-sm">
                                    <tr>
                                    <th className="px-3 py-3 text-left w-14">NO</th>
                                    <th className="px-3 py-3 text-left">Name</th>
                                    <th className="px-3 py-3 text-left">Email</th>
                                    <th className="px-3 py-3 text-left">Role</th>
                                    <th className="px-3 py-3 text-left">Status</th>
                                    <th className="px-3 py-3 text-left">Start Date</th>
                                    <th className="px-3 py-3 text-left">End Date</th>
                                    <th className="px-3 py-3 text-left">Ongoing</th>
                                    <th className="px-3 py-3 text-left">Remaining</th>
                                    <th className="px-3 py-3 text-left w-28">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                                    {currentData.map((p, idx) => {
                                    const d = computeOngoingRemaining(p.startDate, p.endDate);
                                    return (
                                        <tr key={p.id} className="hover:bg-emerald-50/60 transition">
                                        <td className="px-3 py-3 align-middle">{startIndex + idx + 1}</td>
                                        <td className="px-3 py-3 align-middle font-medium">{p.name}</td>
                                        <td className="px-3 py-3 align-middle truncate max-w-[220px]">{p.email}</td>
                                        <td className="px-3 py-3 align-middle">{p.role}</td>
                                        <td className="px-3 py-3 align-middle"><StatusBadge status={p.status} /></td>
                                        <td className="px-3 py-3 align-middle whitespace-nowrap">{toISOInput(p.startDate)}</td>
                                        <td className="px-3 py-3 align-middle whitespace-nowrap">{toISOInput(p.endDate)}</td>
                                        <td className="px-3 py-3 align-middle">{d.ongoing} d</td>
                                        <td className="px-3 py-3 align-middle">{d.remaining} d</td>
                                        <td className="px-3 py-3 align-middle">
                                            <div className="flex justify-start gap-3">
                                            <button
                                                onClick={() => {
                                                setFormData({
                                                    ...p,
                                                    startDate: toISOInput(p.startDate),
                                                    endDate: toISOInput(p.endDate),
                                                });
                                                setIsEditing(true);
                                                setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                            </div>
                                        </td>
                                        </tr>
                                    );
                                    })}

                                    {currentData.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-3 py-10 text-center text-gray-500">
                                        Tidak ada data projek.
                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                {/* Pagination */}
                <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-full border border-gray-200">
                        <button
                        className={`p-2 rounded-full ${currentPage === 0 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        aria-label="Prev"
                        >
                        <FaArrowLeft />
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-8 h-8 rounded-full text-sm ${
                                currentPage === i ? "bg-emerald-500 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            >
                            {i + 1}
                            </button>
                        ))}
                        </div>

                        {/* versi kompak untuk mobile */}
                        <span className="sm:hidden text-sm text-gray-700 px-2">
                        {currentPage + 1} / {totalPages}
                        </span>

                        <button
                        className={`p-2 rounded-full ${currentPage === totalPages - 1 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage === totalPages - 1}
                        aria-label="Next"
                        >
                        <FaArrowRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>

        {/* MODAL Tambah/Edit */}
        {isModalOpen && (
            <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative text-black">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Projek" : "Tambah Projek"}</h2>

                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const s = parseFlexibleDate(formData.startDate);
                    const eD = parseFlexibleDate(formData.endDate);
                    if (!s || !eD) return alert("Tanggal tidak valid (YYYY-MM-DD / DD-MM-YYYY).");
                    if (eD < s) return alert("End Date harus setelah/sama dengan Start Date.");

                    const toSave = {
                    id: isEditing ? formData.id : Date.now(),
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role,
                    status: formData.status,
                    // simpan sebagai YYYY-MM-DD (aman untuk input type=date)
                    startDate: fmtISO(s),
                    endDate: fmtISO(eD),
                    };

                    setProjects((prev) =>
                    isEditing ? prev.map((p) => (p.id === toSave.id ? toSave : p)) : [...prev, toSave]
                    );

                    setIsModalOpen(false);
                    setIsEditing(false);
                    setFormData({
                    id: null,
                    name: "",
                    email: "",
                    role: "User",
                    status: "Pending",
                    startDate: "",
                    endDate: "",
                    });
                }}
                className="space-y-4"
                >
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Projek</label>
                    <input
                    type="text"
                    placeholder="Nama Projek"
                    value={formData.name}
                    onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                    type="email"
                    placeholder="Email PIC"
                    value={formData.email}
                    onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData((s) => ({ ...s, role: e.target.value }))}
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                    </select>
                    </div>

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
                    </select>
                    </div>

                    <div className="hidden sm:block" />
                </div>

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

                <div className="flex justify-end gap-2 mt-4">
                    <button
                    type="button"
                    onClick={() => {
                        setIsModalOpen(false);
                        setIsEditing(false);
                        setFormData({
                        id: null,
                        name: "",
                        email: "",
                        role: "User",
                        status: "Pending",
                        startDate: "",
                        endDate: "",
                        });
                    }}
                    className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                    >
                    Batal
                    </button>
                    <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition">
                    {isEditing ? "Update" : "Tambah"}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* MODAL Import */}
        {isImportModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 text-gray-900 relative animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">📥 Import</h2>
                        <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-red-500 cursor-pointer">✕</button>
                    </div>

                    <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload({ target: { files: [file] } });
                    }}
                    >
                    <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" id="fileUpload" />
                    {!fileName ? (
                        <>
                        <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 font-medium hover:underline">
                            Drag & Drop or Click to upload
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Supported format: XLSX</p>
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
                                        {row.map((cell, j) => (<td key={j} className="p-2 border">{cell}</td>))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Showing first 5 rows only...</p>
                    </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer">Cancel</button>
                        <button onClick={downloadTemplate} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer">Download Template</button>
                        <button onClick={handleImport} disabled={previewData.length === 0} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Import</button>
                    </div>
                </div>
            </div>
        )}

        {sidebarOpen && (<div className="fixed inset-0 backdrop-brightness-30 bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />)}
        </div>
    );
}