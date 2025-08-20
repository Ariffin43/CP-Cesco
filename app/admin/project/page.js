"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaFilePdf, FaFileWord, FaFileExcel, FaFileImport, FaBars, FaHome, FaTable, FaUser, FaSignOutAlt, FaChevronDown,
FaArrowRight, FaArrowLeft, } from "react-icons/fa";
import * as XLSX from "xlsx"; 

export default function Projects() {
    const pathname = usePathname();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({ id: null, name: "", description: "" });
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
            if (exportRef.current && !exportRef.current.contains(e.target)) {
            setExportOpen(false);
            }
            if (modalRef.current && !modalRef.current.contains(e.target)) {
            setIsModalOpen(false);
            setFormData({ id: null, name: "", description: "" });
            setIsEditing(false);
            }
        };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // DUMMY DATA
    useEffect(() => {
        setProjects([
            { id: 1, name: "PT-001", status: "Pending",email: "john@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days"},
            { id: 2, name: "PT-002", status: "Ongoing", email: "jane@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days"},
            { id: 3, name: "PT-003", status: "Finish", email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days"},
            { id: 4, name: "PT-004", status: "Ongoing", email: "sarah@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days"},
            { id: 5, name: "PT-005", status: "Ongoing", email: "david@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days"},
            { id: 6, name: "PT-006", status: "Finish", email: "john@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 7, name: "PT-007", status: "Finish", email: "jane@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 8, name: "PT-008", status: "Finish", email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 9, name: "PT-009", status: "Ongoing", email: "sarah@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 10, name: "PT-010", status: "Ongoing", email: "david@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 11, name: "PT-001", status: "Pending", email: "john@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 12, name: "PT-002", status: "Finish", email: "jane@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 13, name: "PT-003", status: "Ongoing", email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 14, name: "PT-004", status: "Ongoing", email: "sarah@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 15, name: "PT-005", status: "Finish", email: "david@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 16, name: "PT-006", status: "Ongoing", email: "john@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 17, name: "PT-007", status: "Ongoing", email: "jane@example.com", role: "User", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 18, name: "PT-008", status: "Ongoing", email: "michael@example.com", role: "Manager", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 19, name: "PT-009", status: "Ongoing", email: "sarah@example.com", role: "Staff", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
            { id: 20, name: "PT-010", status: "Ongoing", email: "david@example.com", role: "Admin", startDate: "10-01-2025", endDate: "10-05-2025", ongoing: "0", remaining: "152 Days" },
        ]);
    }, []);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const [currentPage, setCurrentPage] = useState(0);

    // CRUD
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
        setProjects((prev) =>
            prev.map((p) =>
            p.id === formData.id ? { ...p, name: formData.name, description: formData.description } : p
            )
        );
        setIsEditing(false);
        } else {
        setProjects([...projects, { id: Date.now(), name: formData.name, description: formData.description }]);
        }
        setFormData({ id: null, name: "", description: "" });
        setIsModalOpen(false);
    };

    const handleDelete = (id) => setProjects(projects.filter((p) => p.id !== id));

    // EXPORT
    const exportPDF = () => window.print();

    const exportExcel = () => {
        const data = [
            ["No", "Name", "Status","Email", "Role", "Start Date", "End Date",  "Ongoing", "Remaining"],
            ...projects.map((p) => [p.id, p.name, p.status, p.email, p.role, p.startDate, p.endDate, p.ongoing, p.remaining,])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);

        const colWidths = [
            { wch: 6 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
        ];
        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Projects");

        XLSX.writeFile(wb, "projects.xlsx");
    };

    function excelDateToJSDate(serial) {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);

        return date_info.toISOString().split("T")[0];
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setUploading(true);
        setUploadProgress(0);

        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const converted = data.map((row, idx) => {
                if (idx === 0) return row;
                return row.map((cell, i) => {
                    if (i === 5 || i === 6) {
                    return excelDateToJSDate(cell);
                    }
                    return cell;
                });
            });

            setPreviewData(converted);
            setFileName(file.name);
            setUploading(false);
            setUploadProgress(100);
        };

        reader.readAsBinaryString(file);

        reader.onprogress = (evt) => {
            if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                setUploadProgress(percent);
            }
        };
    };

    const handleImport = () => {
        if (previewData.length <= 1) return;

        const headers = previewData[0];
        const rows = previewData.slice(1);

        const importedProjects = rows.map((row, index) => {
            const rowData = {};
            headers.forEach((h, i) => {
                rowData[h] = row[i] || "";
            });

            return {
                id: Date.now() + index,
                name: rowData["Name"] || `PT-${index + 1}`,
                status: rowData["Status"] || "Pending",
                email: rowData["Email"] || "",
                role: rowData["Role"] || "",
                startDate: rowData["Start Date"] || "",
                endDate: rowData["End Date"] || "",
                ongoing: rowData["Ongoing"] || "0",
                remaining: rowData["Remaining"] || "",
            };
        });

        setProjects((prev) => [...prev, ...importedProjects]);

        setIsImportModalOpen(false);
        setPreviewData([]);
        setUploading(false);
        setUploadProgress(0);
    };

    const downloadTemplate = () => {
        const templateData = [
            ["No", "Name", "Status", "Email", "Role", "Start Date", "End Date", "Ongoing", "Remaining"],
            ["", "", "", "", "", "", "", "", ""],
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);

        const colWidths = [
            { wch: 6 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
        ];
        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        XLSX.writeFile(wb, "template_import.xlsx");
    };

    const exportWord = () => {
        const content = projects.map((p) => `${p.id}. ${p.name} - ${p.description}`).join("\n");
        const blob = new Blob([content], { type: "application/msword" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "projects.doc";
        link.click();
    };

    const startIndex = currentPage * itemsPerPage;
    const currentData = projects.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* NAVBAR */}
            <nav className="w-full bg-green-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
                <button
                    className="md:hidden p-2"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <FaBars size={22} />
                </button>

                <button
                    className="hidden md:block p-2 cursor-pointer"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <FaBars size={22} />
                </button>

                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    🌿 Admin Dashboard
                </h1>
                <div className="flex items-center gap-4">
                    <FaUser className="hidden sm:block" />
                    <FaSignOutAlt className="cursor-pointer" />
                </div>
            </nav>

            {/* LAYOUT */}
            <div className="flex flex-1">
                {/* SIDEBAR */}
                <aside
                className={`${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } fixed top-12 left-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 z-40`}
                >
                    <ul className="space-y-4 p-6 text-gray-700 font-medium">
                        <li>
                        <Link
                            href="/admin/dashboard"
                            className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md 
                            ${
                                pathname === "/admin/dashboard"
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "hover:text-green-600"
                            }`}
                        >
                            <FaHome /> Home
                        </Link>
                        </li>
                        <li>
                        <Link
                            href="/admin/project"
                            className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md 
                            ${
                                pathname === "/admin/project"
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "hover:text-green-600"
                            }`}
                        >
                            <FaTable /> Projects
                        </Link>
                        </li>
                    </ul>
                </aside>

                {/* MAIN */}
                <main className="flex-1 p-4 md:p-6 lg:p-10">
                    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6 gap-3">
                        {/* Add Button */}
                        <div className="flex text-black flex-wrap items-center gap-3">
                            {/* Export Dropdown */}
                            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6 gap-3">
                                {/* Export Dropdown */}
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
                                onClick={() => setIsModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow transition cursor-pointer"
                                >
                                    <FaPlus /> Tambah Projek
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base lg:text-lg 2xl:text-2xl">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="border p-2 sm:p-4">NO</th>
                                    <th className="border p-2 sm:p-4">Name</th>
                                    <th className="border p-2 sm:p-4">Email</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                    <th className="border p-2 sm:p-4">Status</th>
                                    <th className="border p-2 sm:p-4">Start Date</th>
                                    <th className="border p-2 sm:p-4">End Date</th>
                                    <th className="border p-2 sm:p-4">Ongoing</th>
                                    <th className="border p-2 sm:p-4">Remaining</th>
                                    <th className="border p-2 sm:p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-black">
                            {currentData.map((p, idx) => (
                                <tr
                                key={p.id}
                                className="odd:bg-gray-50 even:bg-white border border-black"
                                >
                                <td className="p-3 border">{startIndex + idx + 1}</td>
                                <td className="p-3 border">{p.name}</td>
                                <td className="p-3 border">{p.email}</td>
                                <td className="p-3 border">{p.role}</td>
                                <td className="p-3 border">{p.status}</td>
                                <td className="p-3 border">{p.startDate}</td>
                                <td className="p-3 border">{p.endDate}</td>
                                <td className="p-3 border">{p.ongoing}</td>
                                <td className="p-3 border">{p.remaining}</td>
                                <td className="p-3 flex gap-3 justify-center">
                                    <button
                                    onClick={() => {
                                        setFormData(p);
                                        setIsEditing(true);
                                        setIsModalOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                                    >
                                    <FaEdit />
                                    </button>
                                    <button
                                    onClick={() => handleDelete(p.id)}
                                    className="text-red-600 hover:text-red-800 transition cursor-pointer"
                                    >
                                    <FaTrash />
                                    </button>
                                </td>
                                </tr>
                            ))}

                            {currentData.length === 0 && (
                                <tr>
                                <td colSpan="10" className="text-center py-6 text-gray-500">
                                    Tidak ada data projek.
                                </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Info */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full">
                            
                            {/* Tombol Prev */}
                            <button
                            className={`p-2 rounded-full transition ${
                                currentPage === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            >
                            <FaArrowLeft />
                            </button>

                            {/* Nomor Halaman */}
                            <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition 
                                    ${
                                    currentPage === i
                                        ? "bg-green-500 text-white font-semibold shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                {i + 1}
                                </button>
                            ))}
                            </div>

                            {/* Tombol Next */}
                            <button
                            className={`p-2 rounded-full transition ${
                                currentPage === totalPages - 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                            >
                            <FaArrowRight />
                            </button>
                        </div>
                    </div>

                </main>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative text-black"
                    >
                    <h2 className="text-xl font-bold mb-4">
                        {isEditing ? "Edit Projek" : "Tambah Projek"}
                    </h2>
                    <form
                        onSubmit={(e) => {
                        e.preventDefault();

                        // Hitung remaining days
                        const start = new Date(formData.startDate);
                        const end = new Date(formData.endDate);
                        const today = new Date();
                        const diffTime = Math.max(end - today, 0);
                        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        const newData = {
                            ...formData,
                            ongoing: "0",
                            remaining: `${remainingDays} Days`,
                        };

                        if (isEditing) {
                            setProjects((prev) =>
                            prev.map((proj) =>
                                proj.id === formData.id ? newData : proj
                            )
                            );
                        } else {
                            setProjects((prev) => [
                            ...prev,
                            { ...newData, id: prev.length + 1 },
                            ]);
                        }

                        // Reset form
                        setIsModalOpen(false);
                        setFormData({
                            id: null,
                            name: "",
                            email: "",
                            role: "User",
                            status: "Pending",
                            startDate: "",
                            endDate: "",
                            ongoing: "0",
                            remaining: "",
                        });
                        setIsEditing(false);
                        }}
                        className="space-y-4"
                    >
                        {/* Project Name */}
                        <input
                        type="text"
                        placeholder="Nama Projek"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                        />

                        {/* Email */}
                        <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                        />

                        {/* Role */}
                        <select
                        value={formData.role}
                        onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                        }
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                        </select>

                        {/* Status */}
                        <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Finish">Finish</option>
                        </select>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                            }
                            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                            }
                            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                            setIsModalOpen(false);
                            setFormData({
                                id: null,
                                name: "",
                                email: "",
                                role: "User",
                                status: "Pending",
                                startDate: "",
                                endDate: "",
                                ongoing: "0",
                                remaining: "",
                            });
                            setIsEditing(false);
                            }}
                            className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition"
                        >
                            {isEditing ? "Update" : "Tambah"}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 text-gray-900 relative animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">📥 Import</h2>
                        <button
                        onClick={() => setIsImportModalOpen(false)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                        ✕
                        </button>
                    </div>

                    {/* Upload Area */}
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload({ target: { files: [file] } });
                        }}
                    >
                        <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="fileUpload"
                        />
                        {!fileName ? (
                        <>
                            <label
                            htmlFor="fileUpload"
                            className="cursor-pointer text-blue-600 font-medium hover:underline"
                            >
                            Drag & Drop or Click to upload
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Supported format: XLSX</p>
                        </>
                        ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2 w-full">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-xl">
                                📊
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                                <div
                                    className="bg-blue-500 h-2 rounded transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                setFileName("");
                                setPreviewData([]);
                                setUploadProgress(0);
                                setUploading(false);
                                }}
                                className="text-gray-400 hover:text-red-500 ml-2"
                            >
                                ✕
                            </button>
                            </div>
                            <span className="text-sm text-gray-600 ml-3">{uploadProgress}%</span>
                        </div>
                        )}
                    </div>

                    {/* Import Preview */}
                    {previewData.length > 0 && (
                        <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-2">🔍 Import Preview</h3>
                        <div className="border rounded-lg overflow-auto max-h-60">
                            <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                {previewData[0].map((col, i) => (
                                    <th key={i} className="p-2 border text-left font-medium">
                                    {col}
                                    </th>
                                ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.slice(1, 6).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    {row.map((cell, j) => (
                                    <td key={j} className="p-2 border">
                                        {cell}
                                    </td>
                                    ))}
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Showing first 5 rows only...
                        </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                        onClick={() => setIsImportModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
                        >
                        Cancel
                        </button>
                        <button
                        onClick={downloadTemplate}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                        >
                        Download Template
                        </button>
                        <button
                        onClick={handleImport}
                        disabled={previewData.length === 0}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                        Import
                        </button>
                    </div>
                    </div>
                </div>
            )}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 backdrop-brightness-30 bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}