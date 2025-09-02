"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaEyeSlash, FaEye } from "react-icons/fa";
import Image from "next/image";

export default function Login() {
  const router = useRouter();

  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const demo = useMemo(() => ({ email: "admin@example.com", password: "123456" }), []);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid";
    if (!password) e.password = "Password wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login gagal');
      }

      const nextUrl = new URL(window.location.href).searchParams.get('next') || '/admin/dashboard';

      router.replace(nextUrl);
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("remember") === "1") {
      setRemember(true);
      setEmail(localStorage.getItem("email") || "");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)]">
        {/* Brand side (subtle, simple) */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-neutral-100">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Company Logo" width={250} height={250} priority />
          </div>

          <div>
            <h2 className="text-3xl font-black text-neutral-800 leading-tight">
              Admin Portal
            </h2>
            <p className="mt-3 text-neutral-600">
              Masuk untuk mengelola proyek dan melihat progress terkini.
            </p>
          </div>

          <div className="text-xs text-neutral-500">
            © {new Date().getFullYear()} CESCO. All rights reserved.
          </div>
        </div>

        {/* Form side */}
        <div className="p-6 sm:p-8">
          {/* Back */}
          <button
            onClick={() => ((window.location.href = "/"))}
            className="group inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 cursor-pointer"
          >
            <FaArrowLeft className="transition group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-neutral-900">Masuk</h1>
            <p className="text-neutral-600 text-sm mt-1">
              Gunakan kredensial admin Anda untuk melanjutkan.
            </p>
          </div>

          {errors.general && (
            <div role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.general}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-err" : undefined}
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:ring-2 ${
                  errors.email
                    ? "border-red-400 focus:ring-red-300"
                    : "border-neutral-300 focus:border-neutral-900 focus:ring-neutral-300"
                }`}
              />
              {errors.email && (
                <p id="email-err" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-800 mb-1">
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) =>
                    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))
                  }
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password || capsOn ? "pwd-err" : undefined
                  }
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-24 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:ring-2 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-300"
                      : "border-neutral-300 focus:border-neutral-900 focus:ring-neutral-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 my-1 px-3 text-sm rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {(errors.password || capsOn) && (
                <p id="pwd-err" className="mt-1 text-sm">
                  {errors.password ? (
                    <span className="text-red-600">{errors.password}</span>
                  ) : (
                    <span className="text-amber-700">Caps Lock aktif</span>
                  )}
                </p>
              )}
            </div>

            {/* Remember + demo */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-800 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-neutral-800"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-2.5 font-semibold text-white transition-all cursor-pointer ${
                loading
                  ? "bg-neutral-400"
                  : "bg-neutral-900 hover:bg-black focus:ring-2 focus:ring-neutral-300"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing…
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
