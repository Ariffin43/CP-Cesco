"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBars, FaUser, FaSignOutAlt, FaPlus, FaEdit, FaTrash,
  FaSearch, FaSortAmountDown, FaSortAmountUp, FaBuilding,
  FaImage, FaRegFileAlt,
} from "react-icons/fa";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

const poppins = Poppins({ subsets: ["latin"], weight: ["400","500","600","700"] });
const API_BASE = "/api/facilities";

export default function FacilitiesAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  // UI helpers
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true); // default A→Z
  const [dense, setDense] = useState(false);

  // CRUD states
  const [facils, setFacils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", desc: "", image: "" });
  const [imgOk, setImgOk] = useState(true);

  // drag & drop
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // ===== Bootstrap =====
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

  const fetchFacils = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch facilities");
      const data = await res.json();
      setFacils(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacils(); }, []);

  // ===== Derived data =====
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = facils;
    if (q) {
      arr = arr.filter(
        (c) => c.title?.toLowerCase().includes(q) || c.desc?.toLowerCase?.().includes(q)
      );
    }
    arr = [...arr].sort((a, b) => {
      const x = a.title?.toLowerCase() || "";
      const y = b.title?.toLowerCase() || "";
      return sortAsc ? x.localeCompare(y) : y.localeCompare(x);
    });
    return arr;
  }, [facils, search, sortAsc]);

  // ===== Handlers =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      Swal.fire("Validation", "Title is required.", "warning");
      return;
    }

    try {
      setUploading(true);
      let res;

      if (editing) {
        // UPDATE
        if (form.image instanceof File) {
          const fd = new FormData();
          fd.append("title", form.title.trim());
          fd.append("desc", (form.desc || "").trim());
          fd.append("file", form.image);
          res = await fetch(`${API_BASE}?id=${editing.id}`, { method: "PUT", body: fd });
        } else {
          res = await fetch(`${API_BASE}?id=${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: form.title.trim(), desc: (form.desc || "").trim() }),
          });
        }
      } else {
        // CREATE
        if (!(form.image instanceof File)) {
          Swal.fire("Validation", "Please choose an image file.", "warning");
          setUploading(false);
          return;
        }
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("desc", (form.desc || "").trim());
        fd.append("file", form.image);
        res = await fetch(API_BASE, { method: "POST", body: fd });
      }

      if (!res.ok) throw new Error(editing ? "Update failed" : "Create failed");

      await fetchFacils();
      closeModal();
      Swal.fire("Success", editing ? "Facility updated" : "Facility created", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Operation failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({ title: c.title || "", desc: c.desc || "", image: "" });
    setPreview(c.imageUrl || "");
    setImgOk(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this facility?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchFacils();
      Swal.fire("Deleted", "Facility has been removed", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        await Swal.fire({
          title: "Success",
          text: "Redirecting to Login…",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        router.replace("/Login");
      } catch (err) {
        console.error("Logout failed", err);
        Swal.fire("Error", "Logout failed, please try again.", "error");
      }
    }
  };

  // ===== File select / Drag & Drop =====
  const onPickFile = () => fileInputRef.current?.click();

  const onFilesSelected = (file) => {
    if (file) {
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        Swal.fire("Validation", "Only PNG/JPEG are allowed.", "warning");
        return;
      }
      const MAX = 8 * 1024 * 1024; // 8MB
      if (file.size > MAX) {
        Swal.fire("Validation", `Max file size is 8MB. Got ${(file.size / 1024 / 1024).toFixed(2)}MB.`, "warning");
        return;
      }
      setForm((s) => ({ ...s, image: file }));
      const url = URL.createObjectURL(file);
      setPreview((old) => {
        if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
        return url;
      });
      setImgOk(true);
    }
  };

  // ✅ Pakai event React langsung (lebih stabil di Next/React)
  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(true);
  };
  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation();
    // hint untuk browser
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onFilesSelected(f);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm({ title: "", desc: "", image: "" });
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setDragActive(false);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-white ${poppins.className}`}>
      {/* NAVBAR */}
      <nav className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
        <Sidebar open={sidebarOpen} pathname={pathname} onClose={() => setSidebarOpen(false)} role={role} />
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />}
        <button className="md:hidden p-2" onClick={() => setSidebarOpen((s) => !s)}><FaBars size={22} /></button>
        <button className="hidden md:block p-2 cursor-pointer" onClick={() => setSidebarOpen((s) => !s)}><FaBars size={22} /></button>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {role === "user" && (
            <Link href="/admin/profile" className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" title="Profile" aria-label="Profile">
              <FaUser className="cursor-pointer" />
            </Link>
          )}
          <button type="button" onClick={handleLogout} title="Logout" className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" aria-label="Logout">
            <FaSignOutAlt className="cursor-pointer" />
          </button>
        </div>
      </nav>

      {/* ====== CONTENT ====== */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page header */}
          <div className="mb-6 rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="bg-emerald-600 text-white px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-white" size={22} />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Facilities</h2>
                    <p className="text-white/90 text-sm">Manage your company facilities</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ title: "", desc: "", image: "" });
                    setImgOk(true);
                    setPreview("");
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl shadow cursor-pointer"
                >
                  <FaPlus /> Add Facility
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search facilities…"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortAsc((s) => !s)}
                  className="inline-flex items-center gap-2 border px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                  title="Sort"
                >
                  {sortAsc ? <FaSortAmountUp /> : <FaSortAmountDown />} {sortAsc ? "A → Z" : "Z → A"}
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className={`grid gap-4 ${dense ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border bg-white overflow-hidden animate-pulse">
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white border rounded-3xl shadow-sm">
              <div className="mx-auto w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-4xl mb-4">
                <FaRegFileAlt />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No data yet</h3>
              <p className="text-gray-500">Add your first facility to get started.</p>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ title: "", desc: "", image: "" });
                  setImgOk(true);
                  setPreview("");
                  setIsModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
              >
                <FaPlus /> Add Facility
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${dense ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
              {filtered.map((c) => (
                <div key={c.id} className="group border rounded-2xl shadow-sm bg-white overflow-hidden flex flex-col transition hover:shadow-md hover:-translate-y-0.5">
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400.png?text=Image+Not+Available"; }}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{c.title}</h3>
                    {c.desc && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{c.desc}</p>}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => startEdit(c)} className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg cursor-pointer">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-xs text-gray-500">
                    {new Date(c.createdAt ?? Date.now()).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ===== Modal Add/Edit ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{editing ? "Edit Facility" : "Add Facility"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder:text-gray-400"
                  placeholder="Facility title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Description</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))}
                  className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder:text-gray-400"
                  placeholder="Short description (optional)"
                  rows={3}
                />
              </div>

              {/* Drag & Drop Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">Upload Image</label>
                <div
                  ref={dropRef}
                  onClick={onPickFile}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition cursor-pointer
                    ${dragActive ? "ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/40"
                                  : "border-gray-200 hover:border-emerald-300"}`}
                >
                  <FaImage className="text-gray-500 mb-2" size={36} />
                  <p className="text-gray-700 font-medium">Drag & drop your image here</p>
                  <p className="text-gray-500 text-sm">or click to choose a file (PNG/JPEG, max 8MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => onFilesSelected(e.target.files?.[0])}
                  />
                </div>

                {!imgOk && <p className="text-xs text-rose-600 mt-1">Invalid file / failed to load.</p>}

                {/* Preview */}
                {preview && (
                  <div className="mt-3 rounded-xl overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-56 object-cover"
                      onError={() => setImgOk(false)}
                      onLoad={() => setImgOk(true)}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-gray-700 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 cursor-pointer">
                  {uploading ? "Saving…" : editing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} — Admin Dashboard
      </footer>
    </div>
  );
}
