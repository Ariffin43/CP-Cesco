"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaLightbulb,
  FaShieldAlt,
  FaHandsHelping,
  FaLeaf,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

export default function Service() {
  const features = [
    {
      icon: <FaLightbulb className="h-6 w-6" />,
      title: "Creativity",
      desc:
        "Open, trusting, and innovative culture that sparks new ideas and continuous improvement.",
      badge: "Innovation",
      href: "/#contact",
    },
    {
      icon: <FaClock className="h-6 w-6" />,
      title: "Always Operating",
      desc:
        "Available 24/7 to respond quickly and keep your operations moving without delays.",
      badge: "24/7",
      href: "/#contact",
    },
    {
      icon: <FaFileAlt className="h-6 w-6" />,
      title: "Capability",
      desc:
        "Streamlined processes for fast, safe, and high-quality performance—end to end.",
      badge: "Expert Team",
      href: "/#contact",
    },
    {
      icon: <FaShieldAlt className="h-6 w-6" />,
      title: "Safety First",
      desc:
        "Working to the highest industry standards with zero-compromise on safety.",
      badge: "HSE",
      href: "/#contact",
    },
    {
      icon: <FaHandsHelping className="h-6 w-6" />,
      title: "Care",
      desc:
        "Reliable partnership, clear communication, and support that goes the extra mile.",
      badge: "Support",
      href: "/#contact",
    },
    {
      icon: <FaLeaf className="h-6 w-6" />,
      title: "Core Value",
      desc:
        "Respect, integrity, trust, accountability, and responsibility in every delivery.",
      badge: "VALUES",
      href: "/#contact",
    },
  ];

  // animation presets
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#F3F5F7]">

      <div className="mx-auto max-w-[2560px] px-4 sm:px-6 lg:px-10 2xl:px-14 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="inline-block rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs sm:text-sm text-emerald-700 backdrop-blur"
          >
            Why choose <strong>CESCO</strong>
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 text-[clamp(1.6rem,3.2vw,2.6rem)] font-black leading-tight text-emerald-950"
          >
            Reliability, safety, and performance—beautifully integrated
          </motion.h2>
        </div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              variants={item}
              className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-5 sm:p-6 backdrop-blur shadow-[0_20px_60px_-30px_rgba(16,185,129,0.45)] transition-transform will-change-transform hover:-translate-y-1"
            >
              {/* glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-24 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_60%)]" />
              </div>

              {/* badge */}
              <span className="absolute right-3 top-3 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {f.badge}
              </span>

              {/* icon */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition-transform duration-300 group-hover:rotate-6">
                {f.icon}
              </div>

              <h3 className="mt-4 text-[clamp(1.05rem,1.4vw,1.25rem)] font-extrabold text-emerald-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[clamp(0.9rem,1.05vw,1rem)] leading-relaxed text-gray-600">
                {f.desc}
              </p>

              {/* underline accent on hover */}
              <span className="pointer-events-none absolute left-0 bottom-0 h-[3px] w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
            </motion.article>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <p className="text-gray-600 text-sm sm:text-base text-center">
            Need a custom solution? Talk to our engineers today.
          </p>
          <Link
            href="/#contact"
            className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Start a project
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
