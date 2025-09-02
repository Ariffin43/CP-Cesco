"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const FALLBACK_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHVQL3oU8tZQAAAABJRU5ErkJggg==";

function normalizeSrc(raw) {
  if (!raw) return FALLBACK_DATA_URI;
  let s = String(raw).trim();
  if (!s) return FALLBACK_DATA_URI;
  if (s.startsWith("data:") || s.startsWith("http://") || s.startsWith("https://")) return s;
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

export default function MachineGrid({ machines = [] }) {
  if (!machines.length) {
    return (
      <p className="text-center text-gray-500">
        No machines available for this category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {machines.map((machine, i) => {
        const img = normalizeSrc(machine.imageUrl);
        return (
          <motion.div
            key={machine.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white border rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col items-center"
          >
            <div className="w-full h-[200px] relative">
              <Image
                src={img}
                alt={machine.name}
                fill
                className="object-contain"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                priority={i < 3}
              />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900 text-center">
              {machine.name}
            </h3>
            {machine.desc ? (
              <p className="mt-2 text-sm text-gray-600 text-center">{machine.desc}</p>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
