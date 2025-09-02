"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Hero() {
  // Ganti sesuai asetmu
  const slides = [
    {
      src: "/4.jpg",
      alt: "Offshore operations",
      headline: "Your Trusted Partner in Maritime & Energy",
      sub: "Mechanical completion & pre-commissioning for maritime, oil & gas, and petrochemical industries.",
    },
    {
      src: "/3.jpg",
      alt: "Pipeline & commissioning",
      headline: "Precision. Safety. Reliability.",
      sub: "ISO 9001:2015 certified — delivering to international standards with zero-accident commitment.",
    },
    {
      src: "/2.jpg",
      alt: "Engineering excellence",
      headline: "From Yard to Offshore, End-to-End",
      sub: "Flange management, valve services, N2He leak test, pipe flushing, hydraulic torque, and more.",
    },
  ];

  const DURATION = 4000;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const touchX = useRef(null);

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const goTo = (i) => setCurrent(i);

  // autoplay
  useEffect(() => {
    timerRef.current = setInterval(next, DURATION);
    return () => clearInterval(timerRef.current);
  }, [ current]);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // swipe (mobile)
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <section
      id="home"
      className="relative w-full h-[100svh] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background slideshow + Ken Burns */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {slides.map((s, i) =>
            i === current ? (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0"
                  // Ken Burns: zoom & slight pan
                  initial={{ scale: 1.06, x: 10 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ duration: DURATION / 1000 + 0.2, ease: "linear" }}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Readability overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-28">
          <div className="max-w-[2560px] mx-auto">
            <div className="max-w-3xl md:max-w-4xl">
              <motion.h1
                key={`h-${current}`}
                className="text-white font-black leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]
                           text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {slides[current].headline}
              </motion.h1>

              <motion.p
                key={`p-${current}`}
                className="mt-4 text-white/90 leading-relaxed
                           text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-3xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              >
                {slides[current].sub}
              </motion.p>

              {/* Chips */}
              <motion.div
                className="mt-5 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                {["Maritime", "Oil & Gas", "Petrochemical", "Pre-Commissioning"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-white/10 text-white/90
                               border border-white/20 px-3 py-1 text-xs md:text-sm backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                className="mt-6 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <a
                  href="#contact"
                  className="cursor-pointer inline-flex items-center justify-center rounded-lg
                             bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
                             px-5 md:px-6 py-2.5 md:py-3 shadow-md shadow-emerald-900/20
                             focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Start Collaborating
                </a>
                <a
                  href="#services"
                  className="cursor-pointer inline-flex items-center justify-center rounded-lg
                             bg-white/10 hover:bg-white/15 text-white font-semibold
                             px-5 md:px-6 py-2.5 md:py-3 border border-white/25 backdrop-blur
                             focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Explore Services
                </a>

                {/* ISO badge */}
                <span className="ml-0 md:ml-3 mt-2 md:mt-0 inline-flex items-center gap-2 text-white/80 text-xs md:text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(74,222,128,0.8)]" />
                  ISO 9001:2015 Certified
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {slides.map((_, i) => {
            const active = i === current;
            return (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`cursor-pointer relative h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full
                            ${active ? "bg-emerald-400" : "bg-white/55 hover:bg-white/80"}`}
              >
                {/* tiny progress ring effect */}
                {active && (
                  <span className="absolute -inset-1 rounded-full border border-emerald-400/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
