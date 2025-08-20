"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email wajib diisi!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid!";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi!";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email === "admin@example.com" && password === "123456") {
        router.push("/admin/dashboard");
      } else {
        setErrors({ general: "Email atau password salah!" });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative"
      >
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-2 text-green-600 hover:text-green-800 transition cursor-pointer"
        >
          <FaArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-green-700 text-center mb-6 mt-4">
          Welcome Back 👋
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please log in to proceed to your dashboard.
        </p>

        {/* Error General */}
        {errors.general && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 text-gray-700 py-2 rounded-lg border ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
              } focus:ring-2 focus:border-green-500 outline-none transition`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 text-gray-700 py-2 rounded-lg border ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
              } focus:ring-2 focus:border-green-500 outline-none transition`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end text-sm">
            <Link href="#" className="text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-md disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}