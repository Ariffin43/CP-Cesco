"use client";

import React, { useState, useEffect, useCallback, useEffect as UseEffect } from "react";
import { FaBars, FaUser, FaSignOutAlt, FaEdit, FaTrash } from "react-icons/fa";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const API = {
  service: "/api/services",
  category: "/api/machine-categories",
  machine: "/api/machines",
};

/** @typedef {"service" | "category" | "machine" | null} ModalType */

export default function Service() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);

  /** @type {[ModalType, Function]} */
  const [modalOpen, setModalOpen] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

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

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, cRes, mRes] = await Promise.all([
        fetch(API.service, { cache: "no-store" }),
        fetch(API.category, { cache: "no-store" }),
        fetch(API.machine, { cache: "no-store" }),
      ]);

      const [sJson, cJson, mJson] = await Promise.all([
        sRes.json(),
        cRes.json(),
        mRes.json(),
      ]);

      setServices(Array.isArray(sJson) ? sJson : []);
      setCategories(Array.isArray(cJson) ? cJson : []);
      setMachines(Array.isArray(mJson) ? mJson : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      Swal.fire("Error", "Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/Login");
    }
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!modalOpen) return;

    const url = API[modalOpen];
    let res;

    try {
      if (modalOpen === "service") {
        // multipart/form-data
        const fd = new FormData();
        if (formData.id != null) fd.append("id", String(formData.id));
        fd.append("name", formData.name || "");
        fd.append("desc", formData.desc || "");
        if (formData.imageFile) fd.append("icon", formData.imageFile);

        const method = formData.id ? "PUT" : "POST";
        res = await fetch(url, { method, body: fd });
      } else if (modalOpen === "category") {
        // multipart/form-data
        const fd = new FormData();
        if (formData.id != null) fd.append("id", String(formData.id));
        fd.append("service_id", String(formData.service_id || ""));
        fd.append("name", formData.name || "");
        fd.append("desc", formData.desc || "");
        if (formData.imageFile) fd.append("file", formData.imageFile);
        const method = formData.id ? "PUT" : "POST";
        res = await fetch(url, { method, body: fd });
      } else if (modalOpen === "machine") {
        // multipart/form-data
        const fd = new FormData();
        if (formData.id != null) fd.append("id", String(formData.id));
        fd.append("category_id", String(formData.category_id || ""));
        fd.append("name", formData.name || "");
        fd.append("desc", formData.desc || "");
        if (formData.imageFile) fd.append("file", formData.imageFile);
        const method = formData.id ? "PUT" : "POST";
        res = await fetch(url, { method, body: fd });
      }

      if (!res || !res.ok) throw new Error("Save failed");

      await Swal.fire("Success", "Data berhasil disimpan", "success");
      setModalOpen(null);
      // bersihkan preview url kalau ada
      if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
      setFormData({});
      fetchAll();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan data", "error");
    }
  }, [modalOpen, formData, fetchAll]);

  const handleDelete = useCallback(
    async (type, id) => {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      try {
        const url = `${API[type]}?id=${id}`;
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        Swal.fire("Deleted", "Data berhasil dihapus", "success");
        fetchAll();
      } catch (e) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    },
    [fetchAll]
  );

  const serviceNameById = Object.fromEntries(services.map((s) => [s.id, s.name]));
  const categoryNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className={`min-h-screen flex flex-col bg-white ${poppins.className}`}>
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
      <main className="flex-1 p-6 space-y-8 bg-gradient-to-b from-emerald-50 via-white to-white">
        {/* HERO + KPI */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-800">
                Service & Machine Directory
              </h2>
              <p className="text-gray-600 mt-1">
                Manage services, machine categories, and machine data in one place, light, fast, and simple.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[320px]">
              <KPI label="Services" value={services?.length ?? 0} tone="emerald" />
              <KPI label="Categories" value={categories?.length ?? 0} tone="sky" />
              <KPI label="Machines" value={machines?.length ?? 0} tone="amber" />
            </div>
          </div>

          {/* Quick nav pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="#sec-services" className="px-3 py-1.5 text-sm rounded-full border border-emerald-200 text-emerald-800 hover:bg-emerald-50">Services</a>
            <a href="#sec-categories" className="px-3 py-1.5 text-sm rounded-full border border-sky-200 text-sky-800 hover:bg-sky-50">Machine Categories</a>
            <a href="#sec-machines" className="px-3 py-1.5 text-sm rounded-full border border-amber-200 text-amber-800 hover:bg-amber-50">Machines</a>
          </div>

          {/* deco */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />
        </section>

        {/* QUICK TIPS */}
        <section className="grid gap-4 lg:grid-cols-3">
          <TipCard title="Tips" tone="emerald">
            Use the button <span className="font-semibold">+ Add</span> in each section to quickly add data.
          </TipCard>
          <TipCard title="Relasi Data" tone="sky">
            <span className="font-medium">Category</span> is connected to <span className="font-medium">Service</span>, and <span className="font-medium">Machine</span> is connected to <span className="font-medium">Category</span>.
          </TipCard>
          <TipCard title="Aksi Cepat" tone="amber">
            Click the <span className="font-semibold">✎</span> icon to edit, and <span className="font-semibold">🗑</span> to delete on a data row.
          </TipCard>
        </section>

        {/* SERVICES */}
        <SectionCard id="sec-services" title="Services" subtitle="A collection of main services that form the umbrella of the machine category.">
          <DataTable
            data={services}
            columns={[
              { key: "id", label: "No", isIndex: true, tone: "muted", headClassName: "w-16" },
              { key: "name", label: "Name", tone: "primary" },
              { key: "desc", label: "Description", tone: "muted", bodyClassName: "max-w-[420px]", truncate: true },
              {
                key: "icon",
                label: "Icon",
                tone: "muted",
                render: (row) => (
                  <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100">
                    {row.icon && (
                      <img
                        src={row.icon}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                  </div>
                ),
              },
              { key: "createdAt", label: "Created At", tone: "muted", format: "datetime", headClassName: "min-w-[180px]" },
            ]}
            onAdd={() => { setModalOpen("service"); setFormData({}); }}
            onEdit={(row) => { setModalOpen("service"); setFormData(row); }}
            onDelete={(id) => handleDelete("service", id)}
          />
        </SectionCard>

        {/* CATEGORIES */}
        <SectionCard id="sec-categories" title="Machine Categories" subtitle="Group machines by service. Ensure the relevant service is available.">
          <DataTable
            data={categories}
            columns={[
              { key: "id", label: "No", isIndex: true, tone: "muted", headClassName: "w-16" },
              { key: "service_id", label: "Service", tone: "muted", render: (row) => serviceNameById[row.service_id] || "-" },
              { key: "name", label: "Category Name", tone: "primary" },
              { key: "desc", label: "Description", tone: "muted", bodyClassName: "max-w-[420px]", truncate: true },
              {
                key: "image",
                label: "Image",
                tone: "muted",
                render: (row) => (
                  <div className="w-14 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100">
                    <img
                      src={`/api/machine-categories/${row.id}/image`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ),
              },
              { key: "createdAt", label: "Created At", tone: "muted", format: "datetime", headClassName: "min-w-[160px]" },
            ]}
            onAdd={() => { setModalOpen("category"); setFormData({}); }}
            onEdit={(row) => { setModalOpen("category"); setFormData(row); }}
            onDelete={(id) => handleDelete("category", id)}
          />
        </SectionCard>

        {/* MACHINES */}
        <SectionCard id="sec-machines" title="Machines" subtitle="List the machines in each category. Write a short description for easy searching.">
          <DataTable
            data={machines}
            columns={[
              { key: "id", label: "No", isIndex: true, tone: "muted", headClassName: "w-16" },
              { key: "category_id", label: "Category", tone: "muted", render: (row) => categoryNameById[row.category_id] || "-" },
              { key: "name", label: "Machine", tone: "primary" },
              { key: "desc", label: "Description", tone: "muted", bodyClassName: "max-w-[420px]", truncate: true },
              {
                key: "image",
                label: "Image",
                tone: "muted",
                render: (row) => (
                  <div className="w-14 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100">
                    <img
                      src={`/api/machines/${row.id}/image`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ),
              },
              { key: "createdAt", label: "Created At", tone: "muted", format: "datetime", headClassName: "min-w-[160px]" },
            ]}
            onAdd={() => { setModalOpen("machine"); setFormData({}); }}
            onEdit={(row) => { setModalOpen("machine"); setFormData(row); }}
            onDelete={(id) => handleDelete("machine", id)}
          />
        </SectionCard>

        {/* FOOT NOTE */}
        <section className="text-center text-xs text-gray-500">
          <span>Need more? Tambahkan filter & pencarian nanti di toolbar tiap section.</span>
        </section>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-40 flex items-center justify-center">
            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-emerald-700 shadow-sm">
              Memuat data…
            </div>
          </div>
        )}
      </main>

      {/* MODAL FORM */}
      {modalOpen && (
        <Modal
          type={modalOpen}
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            // revoke preview URL saat modal ditutup
            if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
            setModalOpen(null);
          }}
          onSave={handleSave}
          services={services}
          categories={categories}
        />
      )}
    </div>
  );
}

function KPI({ label, value, tone = "emerald" }) {
  const toneMap = {
    emerald: { box: "border-emerald-100 bg-emerald-50", label: "text-emerald-700", value: "text-emerald-900" },
    sky: { box: "border-sky-100 bg-sky-50", label: "text-sky-700", value: "text-sky-900" },
    amber: { box: "border-amber-100 bg-amber-50", label: "text-amber-700", value: "text-amber-900" },
  }[tone];

  return (
    <div className={`rounded-xl border ${toneMap.box} p-5`}>
      <div className={`text-xs ${toneMap.label}`}>{label}</div>
      <div className={`text-2xl font-extrabold ${toneMap.value}`}>{value}</div>
    </div>
  );
}

function TipCard({ title, tone = "emerald", children }) {
  const toneMap = {
    emerald: "text-emerald-700",
    sky: "text-sky-700",
    amber: "text-amber-700",
  }[tone];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className={`text-sm font-semibold ${toneMap}`}>{title}</div>
      <p className="text-sm text-gray-600 mt-1">{children}</p>
    </div>
  );
}

function SectionCard({ id, title, subtitle, children }) {
  return (
    <section id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function DataTable({ data, columns = [], onAdd, onEdit, onDelete, startIndex = 0 }) {
  const fmtCell = (col, value) => {
    if (value == null) return "-";
    if (col.format === "datetime") {
      const d = new Date(value);
      if (!isNaN(d)) return d.toLocaleString();
    }
    if (typeof col.format === "function") return col.format(value);
    return String(value);
  };

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-end px-5 py-3 bg-gray-50 rounded-t-xl">
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
        >
          + Add
        </button>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full min-w-max text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2 font-semibold text-left whitespace-nowrap ${c.headClassName || ""}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 odd:bg-white even:bg-gray-50 hover:bg-emerald-50/40 transition-colors"
                >
                  {columns.map((c) => {
                    const tone =
                      c.tone === "primary" ? "text-black"
                      : c.tone === "danger" ? "text-red-600"
                      : "text-gray-600";

                    // jika kolom index, tampilkan nomor urut (startIndex + idx + 1)
                    if (c.isIndex) {
                      return (
                        <td key={c.key} className={`px-4 py-2 align-top ${tone} ${c.bodyClassName || ""}`}>
                          {startIndex + idx + 1}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={c.key}
                        className={`px-4 py-2 align-top ${tone} ${c.bodyClassName || ""}`}
                        style={{ maxWidth: c.maxWidth || undefined }}
                      >
                        {c.render
                          ? c.render(row)
                          : c.truncate
                          ? <span className="line-clamp-2" title={fmtCell(c, row[c.key])}>{fmtCell(c, row[c.key])}</span>
                          : fmtCell(c, row[c.key])}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(row)}
                        title="Edit"
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(row.id)}
                        title="Delete"
                      >
                        <FaTrash />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Modal({ type, formData, setFormData, onClose, onSave, services, categories }) {
  const handleFile = (file) => {
    if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);

    if (!file) {
      setFormData({ ...formData, imageFile: undefined, imagePreview: undefined });
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormData({ ...formData, imageFile: file, imagePreview: preview });
  };

  useEffect(() => {
    return () => {
      if (formData?.imagePreview) {
        try { URL.revokeObjectURL(formData.imagePreview); } catch {}
      }
    };
  }, []);

  const existingPreviewUrl =
    formData?.id && (type === "category" || type === "machine")
      ? `/api/${type === "category" ? "machine-categories" : "machines"}/${formData.id}/image?ts=${Date.now()}`
      : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-0 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <h3 className="text-lg font-bold">
            {formData.id ? "Edit" : "Add"} {type === "service" ? "Service" : type === "category" ? "Category" : "Machine"}
          </h3>
          <p className="text-xs opacity-90 mt-0.5">Lengkapi form di bawah ini lalu simpan.</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {type === "service" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maintenance"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Deskripsi singkat service"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.desc || ""}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Icon (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-500 cursor-pointer"
                />
                {(formData.imagePreview) && (
                  <div className="mt-2 w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {type === "category" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.service_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, service_id: Number(e.target.value) || "" })}
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. HVAC"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Deskripsi singkat kategori"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.desc || ""}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-500 cursor-pointer"
                />
                {(formData.imagePreview || existingPreviewUrl) && (
                  <div className="mt-2 w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={formData.imagePreview || existingPreviewUrl}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {type === "machine" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.category_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) || "" })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Machine Name</label>
                <input
                  type="text"
                  placeholder="e.g. AC Split DAIKIN"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Deskripsi mesin"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-500"
                  value={formData.desc || ""}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-500 cursor-pointer"
                />
                {(formData.imagePreview || existingPreviewUrl) && (
                  <div className="mt-2 w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={formData.imagePreview || existingPreviewUrl}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-700 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}