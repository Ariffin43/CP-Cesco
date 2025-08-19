"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

const images = [
  "/1.jpg","/2.jpg","/3.jpg","/4.jpg","/5.jpg","/6.jpg","/7.jpg","/8.jpg","/9.jpg","/10.jpg",
  "/11.jpg","/12.jpg","/13.jpg","/14.jpg","/15.jpg","/16.jpg","/17.jpg","/18.jpg","/19.jpg","/20.jpg",
  "/21.jpg","/22.jpeg","/23.jpg","/24.jpg","/25.jpg","/26.jpg","/27.jpg","/28.jpg","/29.jpg","/30.jpg",
  "/31.jpg","/32.jpg","/33.jpg","/34.jpg","/35.jpg","/36.jpg","/37.jpg","/38.jpg","/39.jpg","/40.jpg", 
  "/41.jpg","/42.jpg","/43.jpg","/44.jpg","/45.jpg","/46.jpg","/47.jpg","/48.jpg","/49.jpg","/50.jpg",
  "/51.jpg","/52.jpg","/53.jpg","/54.jpg","/55.jpg","/56.jpg","/57.jpg","/58.jpg","/59.jpg","/60.jpg",
  "/61.jpg","/62.jpg","/63.jpg","/64.jpeg"
];

export default function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [totalSlides, setTotalSlides] = useState(1);

  const getSlidesPerGroup = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 2560) return 5 * 2;
    if (width >= 1440) return 4 * 2;
    if (width >= 1024) return 3 * 2;
    if (width >= 640) return 2 * 2;
    return 1 * 2;
  };

  const updateTotalSlides = () => {
    const perGroup = getSlidesPerGroup();
    setTotalSlides(Math.ceil(images.length / perGroup));
  };

  useEffect(() => {
    updateTotalSlides();
    window.addEventListener("resize", updateTotalSlides);
    return () => window.removeEventListener("resize", updateTotalSlides);
  }, []);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

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
            <button className="swiper-button-prev-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
              <FaChevronLeft className="text-black" />
            </button>
            <span className="text-black font-semibold">{currentSlide} / {totalSlides}</span>
            <button className="swiper-button-next-custom w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
              <FaChevronRight className="text-black" />
            </button>
          </div>
        </motion.div>

        {/* Swiper */}
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
            640: { slidesPerView: 2, slidesPerGroup: 2, grid: { rows: 2 } },
            1024: { slidesPerView: 3, slidesPerGroup: 3, grid: { rows: 2 } },
            1440: { slidesPerView: 4, slidesPerGroup: 4, grid: { rows: 2 } },
            2560: { slidesPerView: 5, slidesPerGroup: 5, grid: { rows: 2 } },
          }}
          onSlideChange={(swiper) =>
            setCurrentSlide(
              Math.ceil(swiper.activeIndex / swiper.params.slidesPerGroup) + 1
            )
          }
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="relative w-full h-64 overflow-hidden rounded-lg group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
        >
          {/* Tombol close */}
          <button
            className="absolute top-4 right-4 text-white text-3xl z-10"
            onClick={closeLightbox}
          >
            &times;
          </button>

          {/* Gambar preview */}
          <div className="relative w-[50vh] h-[50vh]">
            <Image
              src={images[lightboxIndex]}
              alt={`Gallery ${lightboxIndex + 1}`}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}
