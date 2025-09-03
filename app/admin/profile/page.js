"use client";

import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaTrash,
  FaSave,
  FaRedo,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const API_AUTH_ME = "/api/auth/me";
const API_COMPANY = "/api/company-profile";

export default function Profile() {
  const pathname = usePathname();
  const router = useRouter();

  // ====== Dashboard-like shared state ======
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_AUTH_ME, { cache: "no-store" });
        if (!res.ok) { setRole(null); return; }
        const data = await res.json();
        setRole(data?.user?.role ?? null);
      } catch { setRole(null); }
    })();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await Swal.fire({
        title: "Success",
        text: "Redirecting to Login…",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      router.replace("/Login");
    } catch {
      Swal.fire("Error", "Logout failed, please try again.", "error");
    }
  };

  // ====== Company form state ======
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [emails, setEmails] = useState([""]);
  const [social, setSocial] = useState({
    instagram: "",
    linkedin: "",
    facebook: "",
    x: "",
  });

  // ====== Helpers ======
  const addEmail = () => setEmails((arr) => [...arr, ""]);
  const removeEmail = (idx) =>
    setEmails((arr) => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)));
  const updateEmail = (idx, val) =>
    setEmails((arr) => arr.map((v, i) => (i === idx ? val : v)));

  const isValidEmail = (v) =>
    !!String(v).trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  const isValidURL = (v) => {
    if (!v) return true;
    try {
      const u = new URL(v.startsWith("http") ? v : `https://${v}`);
      return !!u.hostname;
    } catch {
      return false;
    }
  };

  const normalizeURL = (v) => {
    if (!v) return "";
    return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
  };

  const clearForm = () => {
    setCompanyId(null);
    setCompanyName("");
    setContactPhone("");
    setContactWhatsapp("");
    setAddress("");
    setEmails([""]);
    setSocial({ instagram: "", linkedin: "", facebook: "", x: "" });
  };

  // ====== Load existing company (first record) ======
  const loadCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_COMPANY, { cache: "no-store" });
      if (!res.ok) { clearForm(); return; }
      const data = await res.json(); // may be null
      if (!data) { clearForm(); return; }

      setCompanyId(data.id ?? null);
      setCompanyName(data.name ?? "");
      setContactPhone(data.contactPhone ?? "");
      setContactWhatsapp(data.contactWhatsapp ?? "");
      setAddress(data.address ?? "");
      setEmails(Array.isArray(data.emails) && data.emails.length ? data.emails : [""]);
      setSocial({
        instagram: data?.social?.instagram ?? "",
        linkedin: data?.social?.linkedin ?? "",
        facebook: data?.social?.facebook ?? "",
        x: data?.social?.x ?? "",
      });
    } catch {
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCompany(); }, []);

  // ====== Save (Create/Update) ======
  const handleSave = async (e) => {
    e.preventDefault();

    const cleanedEmails = emails.map((x) => String(x || "").trim()).filter(Boolean);
    if (cleanedEmails.length === 0) {
      Swal.fire("Validation", "Please provide at least one email.", "warning");
      return;
    }
    const bad = cleanedEmails.find((em) => !isValidEmail(em));
    if (bad) {
      Swal.fire("Validation", `Invalid email: ${bad}`, "warning");
      return;
    }

    const socials = {
      instagram: normalizeURL(social.instagram),
      linkedin: normalizeURL(social.linkedin),
      facebook: normalizeURL(social.facebook),
      x: normalizeURL(social.x),
    };
    const badSocial = Object.entries(socials).find(([, url]) => url && !isValidURL(url));
    if (badSocial) {
      Swal.fire("Validation", `Invalid ${badSocial[0]} URL.`, "warning");
      return;
    }

    const payload = {
      name: companyName.trim(),
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
      address: address.trim(),
      emails: cleanedEmails,
      social: socials,
    };

    try {
      setSaving(true);
      let res;
      if (companyId) {
        res = await fetch(`${API_COMPANY}/${companyId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_COMPANY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to save company profile.");
      }
      await loadCompany();
      Swal.fire("Success", companyId ? "Company profile updated." : "Company profile created.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Operation failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ====== Delete ======
  const handleDelete = async () => {
    if (!companyId) return;
    const ask = await Swal.fire({
      title: "Delete company profile?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ask.isConfirmed) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API_COMPANY}/${companyId}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to delete company profile.");
      }
      clearForm();
      Swal.fire("Deleted", "Company profile removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ====== Preview for right card ======
  const previewData = useMemo(
    () => ({
      companyName,
      contactPhone,
      contactWhatsapp,
      address,
      emails: emails.filter(Boolean),
      ...social,
    }),
    [companyName, contactPhone, contactWhatsapp, address, emails, social]
  );

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
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />
        )}
        <button className="md:hidden p-2" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>
        <button className="hidden md:block p-2 cursor-pointer" onClick={() => setSidebarOpen((s) => !s)}>
          <FaBars size={22} />
        </button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">🌿 Admin Dashboard</h1>

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
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Card */}
          <div className="mb-6 rounded-2xl overflow-hidden border shadow-sm">
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Profile & Company Settings</h2>
                <p className="text-white/85 text-sm">
                  Manage company information and social links.
                </p>
              </div>
              {companyId && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg inline-flex items-center gap-2"
                  title="Delete Company Profile"
                >
                  <FaTrash /> {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>

            <div className="p-6 grid lg:grid-cols-2 gap-6">
              {/* FORM */}
              <form onSubmit={handleSave} className="space-y-6">
                {/* Company */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Company Name</label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company name"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Address</label>
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full address"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Contact Phone</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Office phone number"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Contact WhatsApp</label>
                      <input
                        type="tel"
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="WhatsApp number"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emails */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Emails</h3>
                    <button
                      type="button"
                      onClick={addEmail}
                      className="inline-flex items-center gap-2 border px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      <FaPlus /> Add Email
                    </button>
                  </div>
                  <div className="grid gap-3">
                    {emails.map((em, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="email"
                          value={em}
                          onChange={(e) => updateEmail(idx, e.target.value)}
                          placeholder={`email ${idx + 1}`}
                          className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeEmail(idx)}
                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-gray-700"
                          disabled={emails.length <= 1}
                          title="Remove this email"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Social Links</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Instagram</label>
                      <input
                        value={social.instagram}
                        onChange={(e) => setSocial((s) => ({ ...s, instagram: e.target.value }))}
                        placeholder="www.yourIntagramcompany.com"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">LinkedIn</label>
                      <input
                        value={social.linkedin}
                        onChange={(e) => setSocial((s) => ({ ...s, linkedin: e.target.value }))}
                        placeholder="www.yourLinkedincompany.com"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">Facebook</label>
                      <input
                        value={social.facebook}
                        onChange={(e) => setSocial((s) => ({ ...s, facebook: e.target.value }))}
                        placeholder="www.yourFacebookcompany.com"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-800">X (Twitter)</label>
                      <input
                        value={social.x}
                        onChange={(e) => setSocial((s) => ({ ...s, x: e.target.value }))}
                        placeholder="www.yourXcompany.com"
                        className="border px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      Swal.fire({
                        title: "Reset form?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                      }).then((r) => r.isConfirmed && clearForm());
                    }}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <FaRedo /> Reset
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <FaSave /> {saving ? "Saving…" : companyId ? "Update" : "Save"}
                  </button>
                </div>

                {loading && (
                  <div className="text-sm text-gray-500">Loading company profile…</div>
                )}
              </form>

              {/* PREVIEW */}
              <div className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
                <div className="space-y-3 text-sm">
                  <div className="text-gray-800"><span className="font-medium text-black">Company:</span> {previewData.companyName || "-"}</div>
                  <div className="text-gray-800"><span className="font-medium text-black">Address:</span> {previewData.address || "-"}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-gray-800"><span className="font-medium text-black">Phone:</span> {previewData.contactPhone || "-"}</div>
                    <div className="text-gray-800"><span className="font-medium text-black">WhatsApp:</span> {previewData.contactWhatsapp || "-"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-black">Emails:</span>
                    <ul className="list-disc list-inside text-gray-800 mt-1">
                      {(previewData.emails?.length ? previewData.emails : ["-"]).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {["instagram","linkedin","facebook","x"].map((k) => (
                      <div key={k} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2">
                        <div className="text-gray-700 capitalize">{k}</div>
                        {social[k] ? (
                          <a
                            href={normalizeURL(social[k])}
                            target="_blank"
                            className="text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                          >
                            Open <FaExternalLinkAlt />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} — Admin Dashboard
          </div>
        </div>
      </main>
    </div>
  );
}
