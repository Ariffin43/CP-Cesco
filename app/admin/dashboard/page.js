"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTable, FaArrowLeft, FaArrowRight, FaBars, FaHome, FaUser, FaSignOutAlt, } from "react-icons/fa";

export default function Dashboard() {
    const pathname = usePathname();
    const data = [
        { id: 1, name: "PT-001", email: "john@example.com", role: "Admin" },
        { id: 2, name: "PT-002", email: "jane@example.com", role: "User" },
        { id: 3, name: "PT-003", email: "michael@example.com", role: "Manager" },
        { id: 4, name: "PT-004", email: "sarah@example.com", role: "Staff" },
        { id: 5, name: "PT-005", email: "david@example.com", role: "Admin" },
        { id: 6, name: "PT-006", email: "john@example.com", role: "Admin" },
        { id: 7, name: "PT-007", email: "jane@example.com", role: "User" },
        { id: 8, name: "PT-008", email: "michael@example.com", role: "Manager" },
        { id: 9, name: "PT-009", email: "sarah@example.com", role: "Staff" },
        { id: 10, name: "PT-010", email: "david@example.com", role: "Admin" },
        { id: 11, name: "PT-011", email: "john@example.com", role: "Admin" },
        { id: 12, name: "PT-012", email: "jane@example.com", role: "User" },
        { id: 13, name: "PT-013", email: "michael@example.com", role: "Manager" },
        { id: 14, name: "PT-014", email: "sarah@example.com", role: "Staff" },
        { id: 15, name: "PT-015", email: "david@example.com", role: "Admin" },
        { id: 16, name: "PT-016", email: "john@example.com", role: "Admin" },
        { id: 17, name: "PT-017", email: "jane@example.com", role: "User" },
        { id: 18, name: "PT-018", email: "michael@example.com", role: "Manager" },
        { id: 19, name: "PT-019", email: "sarah@example.com", role: "Staff" },
        { id: 20, name: "PT-020", email: "david@example.com", role: "Admin" },
        { id: 21, name: "PT-021", email: "david@example.com", role: "Admin" },
        { id: 22, name: "PT-022", email: "john@example.com", role: "Admin" },
        { id: 23, name: "PT-023", email: "jane@example.com", role: "User" },
        { id: 24, name: "PT-024", email: "michael@example.com", role: "Manager" },
        { id: 25, name: "PT-025", email: "sarah@example.com", role: "Staff" },
        { id: 26, name: "PT-026", email: "david@example.com", role: "Admin" },
        { id: 27, name: "PT-027", email: "john@example.com", role: "Admin" },
        { id: 28, name: "PT-028", email: "jane@example.com", role: "User" },
        { id: 29, name: "PT-029", email: "michael@example.com", role: "Manager" },
        { id: 30, name: "PT-030", email: "sarah@example.com", role: "Staff" },
    ];

    const itemsPerPage = 20;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const [currentPage, setCurrentPage] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalPages]);

    const startIndex = currentPage * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Navbar */}
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

            {/* Layout */}
            <div className="flex flex-1">
                {/* Sidebar */}
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

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-x-auto">
                    <div className="bg-white shadow-lg rounded-xl p-4 md:p-6 lg:p-10 max-w-[3840px] mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 text-black">
                                <FaTable /> Project Activity
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500">
                                <button
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                                onClick={() =>
                                    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
                                }
                                >
                                    <FaArrowLeft />
                                </button>
                                <button
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                                onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
                                >
                                    <FaArrowRight />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base lg:text-lg 2xl:text-2xl">
                                <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="border p-2 sm:p-4">NO</th>
                                    <th className="border p-2 sm:p-4">Name</th>
                                    <th className="border p-2 sm:p-4">Email</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                    <th className="border p-2 sm:p-4">Role</th>
                                </tr>
                                </thead>
                                <tbody className="text-black">
                                {currentData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-100">
                                    <td className="border p-2 sm:p-4 text-center">{row.id}</td>
                                    <td className="border p-2 sm:p-4">{row.name}</td>
                                    <td className="border p-2 sm:p-4">{row.email}</td>
                                    <td className="border p-2 sm:p-4 text-center">{row.role}</td>
                                    <td className="border p-2 sm:p-4 text-center">{row.role}</td>
                                    <td className="border p-2 sm:p-4 text-center">{row.role}</td>
                                    <td className="border p-2 sm:p-4 text-center">{row.role}</td>
                                    <td className="border p-2 sm:p-4 text-center">{row.role}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Info */}
                        <div className="text-center mt-4 text-gray-600 text-sm sm:text-base md:text-lg">
                            Slide {currentPage + 1} / {totalPages}
                        </div>

                        {sidebarOpen && (
                            <div
                                className="fixed inset-0 backdrop-brightness-30 bg-opacity-50 z-30"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}