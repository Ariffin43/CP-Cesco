"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useEffect as UseEffect,
} from "react";
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
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

  // SEARCH + FILTER STATES
  const [qServices, setQServices] = useState("");
  const [qCategories, setQCategories] = useState("");
  const [qMachines, setQMachines] = useState("");

  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

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
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
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
        try {
          // multipart/form-data for service
          const fd = new FormData();
          if (formData.id != null) fd.append("id", String(formData.id));
          fd.append("name", formData.name || "");
          fd.append("desc", formData.desc || "");
          if (formData.imageFile) {
            fd.append("icon", formData.imageFile);
          }

          const method = formData.id ? "PUT" : "POST";

          // debug: outgoing payload
          console.log("📤 Service form data:", {
            id: formData.id || null,
            name: formData.name,
            desc: formData.desc,
            icon: formData.imageFile ? formData.imageFile.name : null,
          });

          res = await fetch(url, { method, body: fd });

          if (!res.ok) {
            const errText = await res.text();
            console.error("❌ Save failed (service):", errText);
            throw new Error(
              `Failed to save service. Status: ${res.status}, Response: ${errText}`
            );
          }
        } catch (err) {
          console.error("🔥 Error in handleSave service:", err);
          throw err;
        }
      } else if (modalOpen === "category") {
        // multipart/form-data for category
        const fd = new FormData();
        if (formData.id != null) fd.append("id", String(formData.id));
        fd.append("service_id", String(formData.service_id || ""));
        fd.append("name", formData.name || "");
        fd.append("desc", formData.desc || "");
        if (formData.imageFile) fd.append("file", formData.imageFile);

        const method = formData.id ? "PUT" : "POST";
        res = await fetch(url, { method, body: fd });

        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Save failed (category):", errText);
          throw new Error(
            `Failed to save category. Status: ${res.status}, Response: ${errText}`
          );
        }
      } else if (modalOpen === "machine") {
        // multipart/form-data for machine
        const fd = new FormData();
        if (formData.id != null) fd.append("id", String(formData.id));
        fd.append("category_id", String(formData.category_id || ""));
        fd.append("name", formData.name || "");
        fd.append("desc", formData.desc || "");
        if (formData.imageFile) fd.append("file", formData.imageFile);

        const method = formData.id ? "PUT" : "POST";
        res = await fetch(url, { method, body: fd });

        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Save failed (machine):", errText);
          throw new Error(
            `Failed to save machine. Status: ${res.status}, Response: ${errText}`
          );
        }
      }

      // success
      await Swal.fire("Success", "Data has been saved successfully", "success");
      setModalOpen(null);

      // clean preview url if any
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }

      setFormData({});
      fetchAll();
    } catch (err) {
      console.error("🔥 Error in handleSave:", err);
      Swal.fire("Error", String(err.message || "Failed to save data"), "error");
    }
  }, [modalOpen, formData, fetchAll]);

  const handleDelete = useCallback(
    async (type, id) => {
      const result = await Swal.fire({
        title: "Delete Confirmation",
        text: "Are you sure you want to delete this item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      try {
        const url = `${API[type]}?id=${id}`;
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        Swal.fire("Deleted", "Item has been deleted successfully", "success");
        fetchAll();
      } catch (e) {
        Swal.fire("Error", "Failed to delete item", "error");
      }
    },
    [fetchAll]
  );

  const serviceNameById = Object.fromEntries(
    services.map((s) => [s.id, s.name])
  );

  const categoryNameById = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  );

  const filteredServices = Array.isArray(services)
    ? services.filter((s) => {
        const q = qServices.trim().toLowerCase();
        if (!q) return true;
        return (
          String(s.name || "")
            .toLowerCase()
            .includes(q) ||
          String(s.desc || "")
            .toLowerCase()
            .includes(q)
        );
      })
    : [];

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((c) => {
        if (
          filterServiceId &&
          String(c.service_id) !== String(filterServiceId)
        ) {
          return false;
        }
        const q = qCategories.trim().toLowerCase();
        if (!q) return true;
        return (
          String(c.name || "")
            .toLowerCase()
            .includes(q) ||
          String(c.desc || "")
            .toLowerCase()
            .includes(q)
        );
      })
    : [];

  const filteredMachines = Array.isArray(machines)
    ? machines.filter((m) => {
        if (
          filterCategoryId &&
          String(m.category_id) !== String(filterCategoryId)
        ) {
          return false;
        }
        const q = qMachines.trim().toLowerCase();
        if (!q) return true;
        return (
          String(m.name || "")
            .toLowerCase()
            .includes(q) ||
          String(m.desc || "")
            .toLowerCase()
            .includes(q)
        );
      })
    : [];

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
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <button
          className="md:hidden p-2"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <FaBars size={22} />
        </button>
        <button
          className="hidden md:block p-2 cursor-pointer"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <FaBars size={22} />
        </button>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">
          Admin Dashboard
        </h1>
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
        <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Title + copy */}
            <div className="max-w-prose">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-800">
                Service &amp; Machine Directory
              </h2>
              <p className="mt-1 text-gray-600 text-sm sm:text-base">
                Manage services, machine categories, and machine data in one place—light, fast, and simple.
              </p>
            </div>

            {/* KPI cards */}
            <div className="w-full lg:w-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KPI label="Services" value={services?.length ?? 0} tone="emerald" />
                <KPI label="Categories" value={categories?.length ?? 0} tone="sky" />
                <KPI label="Machines" value={machines?.length ?? 0} tone="amber" />
              </div>
            </div>
          </div>

          {/* Quick nav pills (scrollable on mobile, wrap on larger screens) */}
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
              <a
                href="#sec-services"
                className="shrink-0 px-3 py-1.5 text-sm rounded-full border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              >
                Services
              </a>
              <a
                href="#sec-categories"
                className="shrink-0 px-3 py-1.5 text-sm rounded-full border border-sky-200 text-sky-800 hover:bg-sky-50"
              >
                Machine Categories
              </a>
              <a
                href="#sec-machines"
                className="shrink-0 px-3 py-1.5 text-sm rounded-full border border-amber-200 text-amber-800 hover:bg-amber-50"
              >
                Machines
              </a>
            </div>
          </div>

          {/* Decorative blob (hide on very small screens) */}
          <div className="pointer-events-none absolute -right-10 -top-10 hidden md:block h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-emerald-100/60 blur-3xl" />
        </section>

        {/* QUICK TIPS */}
        <section className="grid gap-4 lg:grid-cols-3">
          <TipCard title="Tips" tone="emerald">
            Use the <span className="font-semibold">+ Add</span> button in each
            section to quickly add data.
          </TipCard>
          <TipCard title="Data Relationships" tone="sky">
            <span className="font-medium">Category</span> is connected to{" "}
            <span className="font-medium">Service</span>, and{" "}
            <span className="font-medium">Machine</span> is connected to{" "}
            <span className="font-medium">Category</span>.
          </TipCard>
          <TipCard title="Quick Actions" tone="amber">
            Click the <span className="font-semibold">✎</span> icon to edit, and{" "}
            <span className="font-semibold">🗑</span> to delete a data row.
          </TipCard>
        </section>

        {/* SERVICES */}
        <SectionCard
          id="sec-services"
          title="Services"
          subtitle="A collection of main services..."
        >
          <DataTable
            data={filteredServices}
            columns={[
              {
                key: "id",
                label: "No",
                isIndex: true,
                tone: "muted",
                headClassName: "w-16",
              },
              { key: "name", label: "Name", tone: "primary" },
              {
                key: "desc",
                label: "Description",
                tone: "muted",
                bodyClassName: "max-w-[420px]",
                truncate: true,
              },
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "createdAt",
                label: "Created At",
                tone: "muted",
                format: "datetime",
                headClassName: "min-w-[180px]",
              },
            ]}
            searchValue={qServices}
            onSearchChange={setQServices}
            searchPlaceholder="Search services…"
            onAdd={() => {
              setModalOpen("service");
              setFormData({});
            }}
            onEdit={(row) => {
              setModalOpen("service");
              setFormData(row);
            }}
            onDelete={(id) => handleDelete("service", id)}
          />
        </SectionCard>

        {/* CATEGORIES */}
        <SectionCard
          id="sec-categories"
          title="Machine Categories"
          subtitle="Group machines by service. Ensure the relevant service is available."
        >
          <DataTable
            data={filteredCategories}
            columns={[
              {
                key: "id",
                label: "No",
                isIndex: true,
                tone: "muted",
                headClassName: "w-16",
              },
              {
                key: "service_id",
                label: "Service",
                tone: "muted",
                render: (row) => serviceNameById[row.service_id] || "-",
              },
              { key: "name", label: "Category Name", tone: "primary" },
              {
                key: "desc",
                label: "Description",
                tone: "muted",
                bodyClassName: "max-w-[420px]",
                truncate: true,
              },
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "createdAt",
                label: "Created At",
                tone: "muted",
                format: "datetime",
                headClassName: "min-w-[160px]",
              },
            ]}
            searchValue={qCategories}
            onSearchChange={setQCategories}
            searchPlaceholder="Search categories…"
            filterSlot={
              <select
                value={filterServiceId}
                onChange={(e) => setFilterServiceId(e.target.value)}
                className="rounded-lg border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            }
            onAdd={() => {
              setModalOpen("category");
              setFormData({});
            }}
            onEdit={(row) => {
              setModalOpen("category");
              setFormData(row);
            }}
            onDelete={(id) => handleDelete("category", id)}
          />
        </SectionCard>

        {/* MACHINES */}
        <SectionCard
          id="sec-machines"
          title="Machines"
          subtitle="List the machines in each category. Write a short description for easy searching."
        >
          <DataTable
            data={filteredMachines}
            columns={[
              {
                key: "id",
                label: "No",
                isIndex: true,
                tone: "muted",
                headClassName: "w-16",
              },
              {
                key: "category_id",
                label: "Category",
                tone: "muted",
                render: (row) => categoryNameById[row.category_id] || "-",
              },
              { key: "name", label: "Machine", tone: "primary" },
              {
                key: "desc",
                label: "Description",
                tone: "muted",
                bodyClassName: "max-w-[420px]",
                truncate: true,
              },
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "createdAt",
                label: "Created At",
                tone: "muted",
                format: "datetime",
                headClassName: "min-w-[160px]",
              },
            ]}
            searchValue={qMachines}
            onSearchChange={setQMachines}
            searchPlaceholder="Search machines…"
            filterSlot={
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="rounded-lg border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            }
            onAdd={() => {
              setModalOpen("machine");
              setFormData({});
            }}
            onEdit={(row) => {
              setModalOpen("machine");
              setFormData(row);
            }}
            onDelete={(id) => handleDelete("machine", id)}
          />
        </SectionCard>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-40 flex items-center justify-center">
            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-emerald-700 shadow-sm">
              Loading data…
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
            if (formData.imagePreview)
              URL.revokeObjectURL(formData.imagePreview);
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
    emerald: {
      box: "border-emerald-100 bg-emerald-50",
      label: "text-emerald-700",
      value: "text-emerald-900",
    },
    sky: {
      box: "border-sky-100 bg-sky-50",
      label: "text-sky-700",
      value: "text-sky-900",
    },
    amber: {
      box: "border-amber-100 bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-900",
    },
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

function SectionCard({ id, title, subtitle, children, actions, className = "", headerClassName = "" }) {
  const headingId = `${(id || (title || "").toLowerCase().replace(/\s+/g, "-"))}-heading`;
  const descId = subtitle ? `${headingId}-desc` : undefined;

  return (
    <section
      id={id}
      role="region"
      aria-labelledby={headingId}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden scroll-mt-24 ${className}`}
      tabIndex={-1}
    >
      <div className={`flex items-start justify-between gap-3 mb-3 sm:mb-4 ${headerClassName}`}>
        <div className="min-w-0">
          <h3 id={headingId} className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {title}
          </h3>
          {subtitle && (
            <p id={descId} className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {children}
    </section>
  );
}

function DataTable({
  data,
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  startIndex = 0,
  pageSize = 10,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filterSlot,
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / pageSize));
  const paginatedData = Array.isArray(data)
    ? data.slice((page - 1) * pageSize, page * pageSize)
    : [];

  useEffect(() => { setPage(1); }, [data, pageSize, searchValue]);

  const fmtCell = (col, value) => {
    if (value == null) return "-";
    if (col.format === "datetime") {
      const d = new Date(value);
      if (!isNaN(d)) return d.toLocaleString();
    }
    if (typeof col.format === "function") return col.format(value);
    return String(value);
  };

  const renderCell = (col, row) => {
    const v = row[col.key];
    if (col.render) return col.render(row);
    if (col.truncate)
      return (
        <span className="line-clamp-2" title={fmtCell(col, v)}>
          {fmtCell(col, v)}
        </span>
      );
    return fmtCell(col, v);
  };

  // numbered pagination (window + ellipses)
  const getVisiblePages = (current, total, max = 9) => {
    if (total <= max) return [...Array(total)].map((_, i) => i + 1);
    const half = Math.floor((max - 3) / 2);
    const left = Math.max(2, current - half);
    const right = Math.min(total - 1, current + half);
    const out = [1];
    if (left > 2) out.push("…");
    for (let p = left; p <= right; p++) out.push(p);
    if (right < total - 1) out.push("…");
    out.push(total);
    return out;
  };
  const visiblePages = getVisiblePages(page, totalPages, 9);

  // primary column untuk judul card mobile
  const primaryCol =
    columns.find((c) => c.tone === "primary") ||
    columns.find((c) => !c.isIndex) ||
    columns[0];

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 sm:px-5 py-3 bg-gray-50 rounded-t-xl">
        {/* Left: filter + search (stack on small, inline on md+) */}
        <div className="flex w-full md:flex-1 min-w-0 flex-col gap-2 md:flex-row md:items-center">
          {/* filterSlot wrapped so it can be full width on small */}
          {filterSlot && (
            <div className="w-full md:w-auto">{filterSlot}</div>
          )}

          {/* Search input: full width on small, constrained on md+ */}
          {typeof onSearchChange === "function" && (
            <div className="relative w-full md:flex-1 min-w-0 md:max-w-[320px]">
              <input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="block w-full rounded-lg border text-gray-500 border-gray-300 bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
            </div>
          )}
        </div>

        {/* Right: Add button (full width on small, auto on md+) */}
        <button
          onClick={onAdd}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium cursor-pointer"
        >
          + Add
        </button>
      </div>

      {/* ===== Mobile: card list (sm:hidden) ===== */}
      <div className="sm:hidden px-4 py-3 space-y-3">
        {paginatedData.length > 0 ? (
          paginatedData.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 p-3">
                <div>
                  <div className="text-[11px] text-gray-500">
                    #{startIndex + (page - 1) * pageSize + idx + 1}
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-gray-800">
                    {primaryCol ? renderCell(primaryCol, row) : "—"}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit(row)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(row.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* key-value details */}
              <div className="px-3 pb-3">
                <dl className="grid grid-cols-1 gap-2">
                  {columns
                    .filter((c) => !c.isIndex && c.key !== primaryCol?.key)
                    .map((c) => (
                      <div key={c.key} className="flex items-start gap-2">
                        <dt className="min-w-[96px] text-xs font-medium text-gray-500">
                          {c.label}
                        </dt>
                        <dd className="text-sm text-gray-700">
                          {renderCell(c, row)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-gray-500">No data available</div>
        )}
      </div>

      {/* ===== Desktop: table (hidden on <sm) ===== */}
      <div className="hidden sm:block overflow-x-auto">
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
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 odd:bg-white even:bg-gray-50 hover:bg-emerald-50/40 transition-colors"
                >
                  {columns.map((c) => {
                    const tone =
                      c.tone === "primary"
                        ? "text-black"
                        : c.tone === "danger"
                        ? "text-red-600"
                        : "text-gray-600";
                    if (c.isIndex) {
                      return (
                        <td
                          key={c.key}
                          className={`px-4 py-2 align-top ${tone} ${c.bodyClassName || ""}`}
                        >
                          {startIndex + (page - 1) * pageSize + idx + 1}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={c.key}
                        className={`px-4 py-2 align-top ${tone} ${c.bodyClassName || ""}`}
                        style={{ maxWidth: c.maxWidth || undefined }}
                      >
                        {renderCell(c, row)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer"
                        onClick={() => onEdit(row)}
                        title="Edit"
                      >
                        <FaEdit />
                        <span className="hidden md:inline">Edit</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                        onClick={() => onDelete(row.id)}
                        title="Delete"
                      >
                        <FaTrash />
                        <span className="hidden md:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination – centered pill with numbers (shared) */}
      {totalPages > 1 && (
        <div className="flex justify-center py-4">
          <div className="inline-flex items-center gap-4 rounded-full border border-gray-200 bg-white shadow-sm px-4 py-2">
            <button
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-400"
              title="Previous"
            >
              <FaChevronLeft />
            </button>

            <div className="flex items-center gap-4">
              {visiblePages.map((p, i) =>
                p === "…" ? (
                  <span key={`dots-${i}`} className="text-gray-400 select-none">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={
                      p === page
                        ? "w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-semibold"
                        : "text-slate-700 hover:text-slate-900 text-sm"
                    }
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-400"
              title="Next"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({
  type,
  formData,
  setFormData,
  onClose,
  onSave,
  services,
  categories,
}) {
  const handleFile = (file) => {
    if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);

    if (!file) {
      setFormData({
        ...formData,
        imageFile: undefined,
        imagePreview: undefined,
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormData({ ...formData, imageFile: file, imagePreview: preview });
  };

  useEffect(() => {
    return () => {
      if (formData?.imagePreview) {
        try {
          URL.revokeObjectURL(formData.imagePreview);
        } catch {}
      }
    };
  }, []);

  const existingPreviewUrl =
    formData?.id && (type === "category" || type === "machine")
      ? `/api/${type === "category" ? "machine-categories" : "machines"}/${
          formData.id
        }/image?ts=${Date.now()}`
      : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-0 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <h3 className="text-lg font-bold">
            {formData.id ? "Edit" : "Add"}{" "}
            {type === "service"
              ? "Service"
              : type === "category"
              ? "Category"
              : "Machine"}
          </h3>
          <p className="text-xs opacity-90 mt-0.5">
            Fill out the form below, then save.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {type === "service" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maintenance"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the service"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.desc || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Icon (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 cursor-pointer"
                />
                {formData.imagePreview && (
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
                <label className="text-sm font-medium text-gray-700">
                  Service
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.service_id ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_id: Number(e.target.value) || "",
                    })
                  }
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HVAC"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the category"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.desc || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 cursor-pointer"
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
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.category_id ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: Number(e.target.value) || "",
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Machine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. DAIKIN Split AC"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the machine"
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-700"
                  value={formData.desc || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700 cursor-pointer"
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