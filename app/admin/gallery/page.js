"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaImage,
  FaRegFileAlt,
  FaPhotoVideo,
} from "react-icons/fa";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// ===== Image helpers (mengganti <img> dengan <Image/>) =====
const FALLBACK_IMG =
  "https://via.placeholder.com/800x600.png?text=Image+Not+Available";

function isInternalPath(src) {
  if (!src) return false;
  return src.startsWith("/");
}

function isBlobOrData(src) {
  if (!src) return false;
  return src.startsWith("blob:") || src.startsWith("data:");
}

function SafeImage({ src, alt, className, sizes }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);
  const unoptimized = isBlobOrData(imgSrc) || !isInternalPath(imgSrc);

  return (
    <Image
      src={imgSrc || FALLBACK_IMG}
      alt={alt || "image"}
      fill
      sizes={
        sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      }
      className={className}
      unoptimized={unoptimized}
      onError={() => setImgSrc(FALLBACK_IMG)}
    />
  );
}

function SafePreviewImage({ src, alt, className, onOk, onFail }) {
  const [imgSrc] = useState(src);
  // Preview biasanya blob/data → unoptimized
  return (
    <Image
      src={imgSrc}
      alt={alt || "preview"}
      fill
      unoptimized
      className={className}
      onLoadingComplete={() => onOk && onOk()}
      onError={() => onFail && onFail()}
    />
  );
}

export default function Gallery() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // UI helpers
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [dense, setDense] = useState(false);

  // CRUD states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [forms, setForms] = useState([
    { title: "", file: null, preview: "", imgOk: true },
  ]);

  // Refs: input file per-blok
  const fileInputRefs = useRef([]); // <- array of inputs

  /* ========================= Auth ========================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setRole(null);
          return;
        }
        const data = await res.json();
        setRole(data?.user?.role ?? null);
      } catch {
        setRole(null);
      }
    })();
  }, []);

  /* ========================= Fetch items ========================= */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ========================= Derived ========================= */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = items;
    if (q) arr = arr.filter((c) => c.title?.toLowerCase().includes(q));
    arr = [...arr].sort((a, b) => {
      const x = a.title?.toLowerCase() || "";
      const y = b.title?.toLowerCase() || "";
      return sortAsc ? x.localeCompare(y) : y.localeCompare(x);
    });
    return arr;
  }, [items, search, sortAsc]);

  /* ========================= Helpers ========================= */
  const addFormBlock = () => {
    setForms((f) => [...f, { title: "", file: null, preview: "", imgOk: true }]);
  };

  const removeFormBlock = (idx) => {
    setForms((f) => {
      if (f.length === 1) return f; // minimal 1
      const next = [...f];
      const oldPrev = next[idx]?.preview;
      if (oldPrev?.startsWith("blob:")) URL.revokeObjectURL(oldPrev);
      next.splice(idx, 1);
      return next;
    });
  };

  const updateFormTitle = (idx, value) => {
    setForms((f) => {
      const next = [...f];
      next[idx] = { ...next[idx], title: value };
      return next;
    });
  };

  const onPickFile = (idx) => fileInputRefs.current[idx]?.click();

  const validateAndSetFile = (idx, file) => {
    if (!file) return;

    const allowed = ["image/png", "image/jpeg"];
    const maxBytes = 5 * 1024 * 1024; // 5 MB (sinkron dgn pesan)
    if (!allowed.includes(file.type)) {
      Swal.fire("Validation", "Only PNG/JPEG are allowed.", "warning");
      return;
    }
    if (file.size > maxBytes) {
      Swal.fire("Validation", "Max file size is 5MB.", "warning");
      return;
    }

    const url = URL.createObjectURL(file);
    setForms((arr) => {
      const next = [...arr];
      const oldPrev = next[idx]?.preview;
      if (oldPrev?.startsWith("blob:")) URL.revokeObjectURL(oldPrev);
      next[idx] = { ...next[idx], file, preview: url, imgOk: true };
      return next;
    });
  };

  // drag & drop per-blok (opsional)
  const handleDrop = (idx, ev) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files?.[0];
    validateAndSetFile(idx, file);
  };
  const handleDragOver = (ev) => ev.preventDefault();

  const toggleSelect = (id) => {
    const numId = Number(id);
    setSelectedItems((prev) =>
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
    );
  };
  const isSelected = (id) => selectedItems.includes(Number(id));

  /* ========================= Bulk Delete ========================= */
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      Swal.fire("Info", "No items selected.", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: `Delete ${selectedItems.length} selected item(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/gallery`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedItems }),
      });
      if (!res.ok) throw new Error("Bulk delete failed");

      await fetchItems();
      setSelectedItems([]);
      Swal.fire("Deleted", "Selected items have been removed", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Bulk delete failed", "error");
    }
  };

  /* ========================= Submit ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      if (editing) {
        // EDIT MODE: forms[0] saja
        const f = forms[0] || { title: "", file: null };
        if (!f.title.trim()) {
          Swal.fire("Validation", "Title is required.", "warning");
          setUploading(false);
          return;
        }

        let res;
        if (f.file instanceof File) {
          const fd = new FormData();
          fd.append("title", f.title.trim());
          fd.append("file", f.file);
          res = await fetch(`/api/gallery/${editing.id}`, { method: "PUT", body: fd });
        } else {
          res = await fetch(`/api/gallery/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: f.title.trim() }),
          });
        }

        if (!res.ok) throw new Error("Update failed");

        await fetchItems();
        closeModal();
        Swal.fire("Success", "Image updated", "success");
        return;
      }

      // ADD MODE: multiple forms
      const payloads = forms
        .map((f) => ({
          ok: f.title.trim() && f.file instanceof File,
          title: f.title.trim(),
          file: f.file,
        }))
        .filter((p) => p.ok);

      if (payloads.length === 0) {
        Swal.fire("Validation", "Fill at least one form with Title & Image.", "warning");
        setUploading(false);
        return;
      }

      const results = await Promise.allSettled(
        payloads.map(async (p) => {
          const fd = new FormData();
          fd.append("title", p.title);
          fd.append("file", p.file);
          const res = await fetch(`/api/gallery`, { method: "POST", body: fd });
          if (!res.ok) throw new Error("Create failed");
          return res.json();
        })
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      await fetchItems();
      closeModal();

      if (failed === 0) {
        Swal.fire("Success", `${results.length} image(s) added`, "success");
      } else if (failed === results.length) {
        Swal.fire("Error", "All uploads failed.", "error");
      } else {
        Swal.fire("Partial", `${results.length - failed} success, ${failed} failed`, "warning");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Operation failed", "error");
    } finally {
      setUploading(false);
    }
  };

  /* ========================= Row actions ========================= */
  const startEdit = (row) => {
    setEditing(row);
    setForms([
      { title: row.title || "", file: null, preview: row.imageUrl || "", imgOk: true },
    ]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchItems();
      Swal.fire("Deleted", "Image has been removed", "success");
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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    // revoke semua blob previews
    forms.forEach((f) => {
      if (f.preview?.startsWith("blob:")) URL.revokeObjectURL(f.preview);
    });
    setForms([{ title: "", file: null, preview: "", imgOk: true }]);
  };

  // Lock scroll saat modal buka
  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-white ${poppins.className}`}
    >
      {/* NAVBAR */}
      <nav className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-50">
        <Sidebar
          open={sidebarOpen}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          role={role}
        />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <button className="md:hidden p-2" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>
        <button
          className="hidden md:block p-2 cursor-pointer"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <FaBars size={22} />
        </button>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">Admin Dashboard</h1>
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
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6 rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="bg-emerald-600 text-white px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FaPhotoVideo className="text-white" size={22} />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Gallery</h2>
                    <p className="text-white/90 text-sm">Manage your gallery images</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForms([{ title: "", file: null, preview: "", imgOk: true }]);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl shadow"
                >
                  <FaPlus /> Add Image
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
                  placeholder="Search images…"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortAsc((s) => !s)}
                  className="inline-flex items-center gap-2 border px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700"
                  title="Sort"
                >
                  {sortAsc ? <FaSortAmountUp /> : <FaSortAmountDown />} {sortAsc ? "A → Z" : "Z → A"}
                </button>

                {selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow"
                  >
                    <FaTrash /> Delete Selected ({selectedItems.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              className={`grid gap-4 ${
                dense ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
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
              <p className="text-gray-500">Add your first image to get started.</p>
              <button
                onClick={() => {
                  setEditing(null);
                  setForms([{ title: "", file: null, preview: "", imgOk: true }]);
                  setIsModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
              >
                <FaPlus /> Add Image
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                dense
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {filtered.map((g) => (
                <div
                  key={g.id}
                  className="group border rounded-2xl shadow-sm bg-white overflow-hidden flex flex-col transition hover:shadow-md hover:-translate-y-0.5 relative"
                >
                  {/* Checkbox pojok kiri atas */}
                  <div className="absolute top-2 left-2 bg-white rounded-md shadow p-1">
                    <input
                      type="checkbox"
                      checked={isSelected(g.id)}
                      onChange={() => toggleSelect(g.id)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </div>

                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <SafeImage src={g.imageUrl} alt={g.title} className="object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{g.title}</h3>

                    <div className="pt-2 text-xs text-gray-500">
                      {new Date(g.createdAt ?? Date.now()).toLocaleString()}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => startEdit(g)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />

          {/* Card */}
          <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Image" : "Add Image(s)"}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
              {/* SCROLL AREA */}
              <div className="px-6 py-4 space-y-6 overflow-y-auto overscroll-contain">
                {/* MULTI FORM BLOCKS */}
                <div className="space-y-6">
                  {forms.map((f, idx) => (
                    <div key={idx} className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-800">Item {idx + 1}</div>
                        {!editing && forms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFormBlock(idx)}
                            className="text-rose-600 hover:text-rose-700 text-sm inline-flex items-center gap-1"
                            title="Remove this item"
                          >
                            <FaTrash /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">Title</label>
                          <input
                            type="text"
                            value={f.title}
                            onChange={(e) => updateFormTitle(idx, e.target.value)}
                            placeholder="Image title"
                            className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 placeholder:text-gray-400"
                            required={editing || idx === 0}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            {editing ? "Replace Image (optional)" : "Upload Image"}
                          </label>

                          {/* Drop/Click area per-blok */}
                          <div
                            onClick={() => onPickFile(idx)}
                            onDrop={(ev) => handleDrop(idx, ev)}
                            onDragOver={handleDragOver}
                            className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 transition cursor-pointer p-4 flex flex-col items-center justify-center text-center"
                          >
                            <FaImage className="text-gray-500 mb-2" size={36} />
                            <p className="text-gray-700 font-medium">Drag & drop your image here</p>
                            <p className="text-gray-500 text-sm">or click to choose a file (PNG/JPEG, max 5MB)</p>
                            <input
                              ref={(el) => {
                                if (el) fileInputRefs.current[idx] = el;
                              }}
                              type="file"
                              accept="image/png,image/jpeg"
                              className="hidden"
                              onChange={(e) => validateAndSetFile(idx, e.target.files?.[0] || null)}
                            />
                          </div>

                          {!f.imgOk && (
                            <p className="text-xs text-rose-600 mt-1">Invalid file / failed to load.</p>
                          )}
                        </div>
                      </div>

                      {f.preview && (
                        <div className="mt-3 rounded-xl overflow-hidden border relative h-56">
                          <SafePreviewImage
                            src={f.preview}
                            alt={`Preview ${idx + 1}`}
                            className="object-cover"
                            onOk={() =>
                              setForms((arr) => {
                                const next = [...arr];
                                next[idx] = { ...next[idx], imgOk: true };
                                return next;
                              })
                            }
                            onFail={() =>
                              setForms((arr) => {
                                const next = [...arr];
                                next[idx] = { ...next[idx], imgOk: false };
                                return next;
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!editing && (
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={addFormBlock}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50 text-gray-700"
                    >
                      <FaPlus /> Add another
                    </button>
                    <div className="text-sm text-gray-600 self-center">
                      Total forms: <span className="font-semibold text-gray-800">{forms.length}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                >
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
