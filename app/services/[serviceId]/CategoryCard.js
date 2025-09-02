// app/services/[serviceId]/CategoryCard.js
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const FALLBACK_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHVQL3oU8tZQAAAABJRU5ErkJggg==";

function normalizeSrc(raw) {
  if (!raw) return FALLBACK_DATA_URI;
  let s = String(raw).trim();
  if (!s) return FALLBACK_DATA_URI;
  if (s.startsWith("data:") || s.startsWith("http://") || s.startsWith("https://")) return s;
  s = s.replace(/\\/g, "/");
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

export default function CategoryCard({ category, index = 0, serviceId }) {
  const href = `/services/${serviceId}/categories/${category.id}`;
  const img = normalizeSrc(category.imageUrl ?? category.image);
  const title = category.name ?? "Category";
  const desc = category.desc ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="bg-white border rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center"
      >
        <div className="w-full h-[200px] relative">
          <Image
            src={img}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            priority={index < 3}
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>

        <p className="mt-2 text-sm text-gray-600 text-center">{desc}</p>

        <button
          type="button"
          className="mt-5 w-12 h-12 flex items-center justify-center rounded-full border border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition"
          aria-label="Open"
        >
          →
        </button>
      </Link>
    </motion.div>
  );
}
