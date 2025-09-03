"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [totalSlides, setTotalSlides] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load gallery");
        const data = await res.json();
        if (alive) {
          setItems(Array.isArray(data) ? data : []);
          setErr(null);
        }
      } catch (e) {
        if (alive) setErr(e?.message || "Error loading gallery");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const getSlidesPerGroup = () => {
    if (typeof window === "undefined") return 2;
    const width = window.innerWidth;
    if (width >= 2560) return 5 * 2;
    if (width >= 1440) return 4 * 2;
    if (width >= 1024) return 3 * 2;
    if (width >= 640)  return 2 * 2;
    return 1 * 2;
  };

  const updateTotalSlides = () => {
    const perGroup = getSlidesPerGroup();
    const total = Math.max(1, Math.ceil(items.length / perGroup));
    setTotalSlides(total);
    setCurrentSlide((s) => Math.min(s, total));
  };

  useEffect(() => { updateTotalSlides(); }, [items]);
  useEffect(() => {
    const onResize = () => updateTotalSlides();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const slidesData = useMemo(() => items ?? [], [items]);

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
          <h2 className="text-3xl md:text-4xl font-bold text-green-700">Gallery</h2>
          <div className="flex items-center gap-3">
            <button
              className="swiper-button-prev-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition disabled:opacity-40"
              disabled={totalSlides <= 1}
            >
              <FaChevronLeft className="text-black" />
            </button>
            <span className="text-black font-semibold">
              {Math.min(currentSlide, totalSlides)} / {totalSlides}
            </span>
            <button
              className="swiper-button-next-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition disabled:opacity-40"
              disabled={totalSlides <= 1}
            >
              <FaChevronRight className="text-black" />
            </button>
          </div>
        </motion.div>

        {/* State UI */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
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
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            grid={{ rows: 2, fill: "row" }}
            breakpoints={{
              640:  { slidesPerView: 2, slidesPerGroup: 2, grid: { rows: 2 } },
              1024: { slidesPerView: 3, slidesPerGroup: 3, grid: { rows: 2 } },
              1440: { slidesPerView: 4, slidesPerGroup: 4, grid: { rows: 2 } },
              2560: { slidesPerView: 5, slidesPerGroup: 5, grid: { rows: 2 } },
            }}
            onSlideChange={(swiper) => {
              const group = swiper.params.slidesPerGroup || 1;
              const page = Math.floor(swiper.activeIndex / group) + 1;
              setCurrentSlide(page);
            }}
          >
            {slidesData.map((item, index) => (
              <SwiperSlide key={item.id ?? index}>
                <motion.div
                  className="relative w-full h-64 overflow-hidden rounded-lg group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title || `Gallery ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && slidesData[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl z-10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            &times;
          </button>

          <div className="relative w-[50vh] h-[50vh]">
            <Image
              src={slidesData[lightboxIndex].imageUrl}
              alt={slidesData[lightboxIndex].title || `Gallery ${lightboxIndex + 1}`}
              fill
              className="object-contain rounded-lg"
              sizes="50vh"
            />
          </div>
        </div>
      )}
    </section>
  );
}
