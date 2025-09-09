"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/** @typedef {{ id?: string|number, imageUrl: string, title?: string }} GalleryItem */

export default function Gallery() {
  const [items, setItems] = useState(/** @type {GalleryItem[]} */ []);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Pagination (page indicator)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Fallback untuk gambar gagal load
  const [failedKeys, setFailedKeys] = useState(() => new Set());

  // Swiper ref
  const swiperRef = useRef(null);

  // --- Fetch data (abort-safe) ---
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gallery", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Failed to load gallery");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setErr(null);
      } catch (e) {
        if (e.name !== "AbortError")
          setErr(e?.message || "Error loading gallery");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const slidesData = useMemo(() => items ?? [], [items]);

  // --- Helpers paging sinkron dengan grid (rows=2) ---
  const getEffectiveCols = useCallback((swiper) => {
    const spv = swiper?.params?.slidesPerView;
    return typeof spv === "number" && spv > 0 ? spv : 1;
  }, []);

  const getRows = useCallback((swiper) => {
    const rows = swiper?.params?.grid?.rows;
    return typeof rows === "number" && rows > 0 ? rows : 1;
  }, []);

  const recomputePages = useCallback(
    (swiper) => {
      if (!swiper) return;
      const cols = getEffectiveCols(swiper);
      const rows = getRows(swiper);
      const pageSize = Math.max(1, cols * rows);
      const total = Math.max(1, Math.ceil(slidesData.length / pageSize));
      setTotalPages(total);

      // Halaman = floor(activeIndex / cols) + 1
      const page = Math.min(Math.floor(swiper.activeIndex / cols) + 1, total);
      setCurrentPage(page);
    },
    [getEffectiveCols, getRows, slidesData.length]
  );

  // Sinkron saat jumlah item berubah (fallback awal sebelum ref siap)
  useEffect(() => {
    const swiper = swiperRef.current;
    if (swiper) {
      recomputePages(swiper);
    } else {
      const fallbackCols = 1;
      const fallbackRows = 2;
      const pageSize = fallbackCols * fallbackRows;
      setTotalPages(Math.max(1, Math.ceil(slidesData.length / pageSize)));
      setCurrentPage((p) =>
        Math.min(p, Math.max(1, Math.ceil(slidesData.length / pageSize)))
      );
    }

  }, [slidesData.length, recomputePages]);

  // --- Lightbox handlers ---
  const openLightbox = useCallback((index) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const lbPrev = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setLightboxIndex((i) =>
        i === null ? i : (i - 1 + slidesData.length) % slidesData.length
      );
    },
    [slidesData.length]
  );
  const lbNext = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setLightboxIndex((i) => (i === null ? i : (i + 1) % slidesData.length));
    },
    [slidesData.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "ArrowRight") lbNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, lbPrev, lbNext]);

  return (
    <section id="gallery" className="w-full py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 mx-auto">
        {/* Header + Navigation */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-green-700">
            Gallery
          </h2>

          <div className="flex items-center gap-3">
            <button
              className="swiper-button-prev-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition aria-disabled:opacity-40"
              aria-disabled={totalPages <= 1}
              title="Previous"
            >
              <FaChevronLeft className="text-black" />
            </button>

            <span className="text-black font-semibold tabular-nums">
              {Math.min(currentPage, totalPages)} / {totalPages}
            </span>

            <button
              className="swiper-button-next-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition aria-disabled:opacity-40"
              aria-disabled={totalPages <= 1}
              title="Next"
            >
              <FaChevronRight className="text-black" />
            </button>
          </div>
        </motion.div>

        {/* State UI */}
        {loading && (
          <div
            aria-busy="true"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && err && (
          <div className="p-6 rounded-xl border bg-rose-50 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && slidesData.length === 0 && (
          <div className="p-6 rounded-xl border bg-gray-50 text-gray-600">
            Belum ada gambar di galeri.
          </div>
        )}

        {/* Swiper */}
        {!loading && !err && slidesData.length > 0 && (
          <Swiper
            modules={[Navigation, Grid]}
            onSwiper={(sw) => {
              swiperRef.current = sw;
              queueMicrotask(() => recomputePages(sw));
            }}
            onInit={(sw) => recomputePages(sw)}
            onResize={(sw) => recomputePages(sw)}
            onBreakpoint={(sw) => recomputePages(sw)}
            onSlideChange={(sw) => {
              const cols = getEffectiveCols(sw);
              const page = Math.floor(sw.activeIndex / cols) + 1;
              setCurrentPage((p) => (page !== p ? page : p));
            }}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            watchOverflow
            observer
            observeParents
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            slidesPerGroupAuto
            grid={{ rows: 2, fill: "row" }}
            breakpoints={{
              640: { slidesPerView: 2, grid: { rows: 2 } },
              1024: { slidesPerView: 3, grid: { rows: 2 } },
              1440: { slidesPerView: 4, grid: { rows: 2 } },
              2560: { slidesPerView: 5, grid: { rows: 2 } },
            }}
            style={{ paddingBottom: 2 }}
          >
            {slidesData.map((item, index) => {
              const key = String(item.id ?? index);
              const isFailed = failedKeys.has(key);
              const src = isFailed ? "/placeholder.png" : item.imageUrl;

              return (
                <SwiperSlide key={key}>
                  <motion.button
                    type="button"
                    className="relative w-full h-64 overflow-hidden rounded-lg group cursor-pointer outline-none focus:ring-2 focus:ring-green-600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    onClick={() => openLightbox(index)}
                    aria-label={`Buka gambar ${item.title || index + 1}`}
                  >
                    <Image
                      src={src}
                      alt={item.title || `Gallery ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(min-width:1536px) 20vw, (min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      loading={index < 4 ? "eager" : "lazy"}
                      onError={() => {
                        setFailedKeys((prev) => {
                          const next = new Set(prev);
                          next.add(key);
                          return next;
                        });
                      }}
                    />
                  </motion.button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && slidesData[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl z-10"
            onClick={closeLightbox}
            aria-label="Close"
            type="button"
          >
            &times;
          </button>

          {/* Prev / Next */}
          <button
            type="button"
            className="absolute left-4 md:left-8 text-white/80 hover:text-white text-2xl"
            onClick={lbPrev}
            aria-label="Previous image"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            className="absolute right-4 md:right-8 text-white/80 hover:text-white text-2xl"
            onClick={lbNext}
            aria-label="Next image"
          >
            <FaChevronRight />
          </button>

          <div className="relative w-[80vw] max-w-5xl aspect-[16/9]">
            <Image
              src={
                failedKeys.has(
                  String(slidesData[lightboxIndex].id ?? lightboxIndex)
                )
                  ? "/placeholder.png"
                  : slidesData[lightboxIndex].imageUrl
              }
              alt={
                slidesData[lightboxIndex].title ||
                `Gallery ${lightboxIndex + 1}`
              }
              fill
              className="object-contain rounded-lg"
              sizes="80vw"
              onError={() => {
                const key = String(
                  slidesData[lightboxIndex].id ?? lightboxIndex
                );
                setFailedKeys((prev) => new Set(prev).add(key));
              }}
            />
            <div className="absolute bottom-2 right-3 text-white/90 text-sm bg-black/40 px-2 py-1 rounded">
              {lightboxIndex + 1} / {slidesData.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
