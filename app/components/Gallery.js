"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

const images = [
  "/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg", "/7.jpg", "/8.jpg", "/9.jpg", "/10.jpg",
  "/11.jpg", "/12.jpg", "/13.jpg", "/14.jpg", "/15.jpg", "/16.jpg", "/17.jpg", "/18.jpg", "/19.jpg", "/20.jpg",
  "/21.jpg", "/22.jpeg", "/23.jpg", "/24.jpg", "/25.jpg", "/26.jpg", "/27.jpg", "/28.jpg", "/29.jpg", "/30.jpg",
  "/31.jpg", "/32.jpg", "/33.jpg", "/34.jpg", "/35.jpg", "/36.jpg", "/37.jpg", "/38.jpg", "/39.jpg", "/40.jpg", 
  "/41.jpg", "/42.jpg", "/43.jpg", "/44.jpg", "/45.jpg", "/46.jpg", "/47.jpg", "/48.jpg", "/49.jpg", "/50.jpg",
  "/51.jpg", "/52.jpg", "/53.jpg", "/54.jpg", "/55.jpg", "/56.jpg", "/57.jpg", "/58.jpg", "/59.jpg", "/60.jpg",
  "/61.jpg", "/62.jpg", "/63.jpg", "/64.jpeg"
];

export default function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = Math.ceil(images.length / (3 * 2))

  return (
    <section id="gallery" className="bg-white w-full py-20">
      <div className="mx-auto px-4">
        {/* Header + Panah Navigasi */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-green-700">
            Gallery
          </h2>
          <div className="flex items-center gap-3">
            {/* Panah kiri */}
            <button className="swiper-button-prev-custom cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
              <FaChevronLeft className="text-black" />
            </button>

            {/* Nomor Slide */}
            <span className="text-black font-semibold">
              {currentSlide} / {totalSlides}
            </span>

            {/* Panah kanan */}
            <button className="swiper-button-next-custom cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition">
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
          grid={{
            rows: 2,
            fill: "row",
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              grid: { rows: 2 },
            },
            1024: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              grid: { rows: 2 },
            },
          }}
          onSlideChange={(swiper) => {
            setCurrentSlide(
              Math.ceil(swiper.activeIndex / swiper.params.slidesPerGroup) + 1
            );
          }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="relative w-full h-64 overflow-hidden rounded-lg group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: false, amount: 0.2 }}
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
    </section>
  );
}
