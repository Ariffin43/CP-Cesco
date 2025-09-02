"use client";

import Link from "next/link";
import { FaHome, FaTable, FaCertificate, FaImages, FaTools } from "react-icons/fa";

export default function Sidebar({ open, pathname, onClose, role }) {
  const isActive = (p) => pathname === p;

  return (
    <aside
        className={`${
            open ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-12 h-[calc(100vh-3rem)] w-64 bg-white/95 backdrop-blur shadow-xl border-r transition-transform duration-300 z-40`}
        >
        <ul className="space-y-4 p-6 text-gray-700 font-medium">
            <li>
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive("/admin/dashboard")
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={onClose}
                >
                    <FaHome /> Home
                </Link>
            </li>

            {/* MENU ADMIN */}
            {role === "admin" && (
            <>
                <li>
                <Link
                    href="/admin/project"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive("/admin/project")
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={onClose}
                >
                    <FaTable /> Projects
                </Link>
                </li>
            </>
            )}

            {/* MENU USER */}
            {role === "user" && (
                <>
                    <li>
                    <Link
                        href="/admin/sertifikat"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isActive("/admin/sertifikat")
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={onClose}
                    >
                        <FaCertificate /> Sertifikat
                    </Link>
                    </li>

                    <li>
                    <Link
                        href="/admin/gallery"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isActive("/admin/gallery")
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={onClose}
                    >
                        <FaImages /> Gallery
                    </Link>
                    </li>

                    <li>
                    <Link
                        href="/admin/service"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isActive("/admin/service")
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={onClose}
                    >
                        <FaTools /> Service
                    </Link>
                    </li>
                </>
            )}
        </ul>
    </aside>
  );
}
