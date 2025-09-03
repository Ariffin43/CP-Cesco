"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

export default function LoginClean() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!isEmail(email)) e.email = "Invalid email format";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistRemember = () => {
    if (remember) {
      localStorage.setItem("remember", "1");
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("remember");
      localStorage.removeItem("email");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      persistRemember();
      setShowSuccess(true);

      const nextUrl =
        new URL(window.location.href).searchParams.get("next") || "/admin/dashboard";

      setTimeout(() => router.replace(nextUrl), 1100);
    } catch (err) {
      setErrors({ general: err.message || "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("remember") === "1") {
      setRemember(true);
      setEmail(localStorage.getItem("email") || "");
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      {/* Success Toast */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl"
        >
          <div className="flex items-start gap-3 rounded-xl border border-emerald-600 bg-emerald-600 text-white px-4 py-3 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" className="text-emerald-500" stroke="currentColor" />
              <path d="M8 12l2.5 2.5L16 9" className="text-white" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-white">Success</div>
              <div className="text-sm text-white">Logged in successfully. Redirecting…</div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="rounded-md p-1 hover:bg-emerald-700 text-white focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close notification"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" className="text-white" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Left — Hero */}
        <div className="relative hidden lg:flex flex-col justify-between text-white p-10 bg-[url('/image.png')] bg-cover bg-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white text-black grid place-items-center text-sm font-bold">
              A
            </div>
            <span className="text-sm font-semibold text-white">Admin Portal</span>
          </div>

          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Welcome back.
            </h2>
            <p className="mt-3 text-base text-slate-100">
              Sign in to access dashboards and manage operations in real time.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-100">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Role-based security
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Real-time dashboards
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Audit logs & insights
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-100">© {new Date().getFullYear()} Cesco</p>
        </div>

        {/* Right — Form */}
        <div className="p-6 sm:p-10 bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-emerald-700">Sign in</h1>
            <p className="text-sm text-slate-600">Use your admin credentials to continue.</p>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {errors.general}
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-err" : undefined}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-black placeholder:text-slate-400 outline-none transition focus:ring-2
                ${errors.email ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-slate-300 focus:border-emerald-700"}`}
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
                <label htmlFor="password" className="block text-sm font-medium text-emerald-700 mb-1">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs text-slate-600 hover:text-black">
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password || capsOn ? "pwd-err" : undefined}
                  className={`w-full rounded-lg border bg-white px-4 py-3 pr-24 text-black placeholder:text-slate-400 outline-none transition focus:ring-2
                  ${errors.password ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-slate-300 focus:border-emerald-700"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 my-1 px-3 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.77 21.77 0 0 1-3.22 4.31M1 1l22 22" />
                      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {(errors.password || capsOn) && (
                <p id="pwd-err" className="mt-1 text-sm">
                  {errors.password ? (
                    <span className="text-red-600">{errors.password}</span>
                  ) : (
                    <span className="text-amber-700">Caps Lock is on</span>
                  )}
                </p>
              )}
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-black select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-black cursor-pointer"
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
              className={`w-full rounded-lg py-3 font-semibold text-white transition-all cursor-pointer
              ${loading ? "bg-slate-400" : "bg-emerald-700 hover:bg-emerald-900 focus:ring-2 focus:ring-slate-300"}`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-600">
            Need access? <span className="underline text-slate-700 hover:text-black">Contact admin</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
