"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  const slides = [
    { src: "/hero-sec.png", alt: "Slide 1" },
    { src: "/8.png", alt: "Slide 2" },
    { src: "/3.png", alt: "Slide 3" },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section id="home" className="relative w-full h-[100vh] overflow-hidden">
      {/* Background slideshow */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={index === current}
          />
        </div>
      ))}

      {/* Overlay + Content */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-6 md:px-20 text-white z-10">
        <motion.h4
          className="text-lg mb-2 uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Specialized Services To
        </motion.h4>

        <motion.h1
          className="text-4xl md:text-5xl font-bold leading-tight"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Marine, Petrochemical, <br /> Oil & Gas Industries
        </motion.h1>

        <motion.p
          className="mt-4 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          We aim to be the leading mechanical completion & commissioning service
          provider for the marine & petrochemical industries and engineering &
          construction services to the construction & general industries.
        </motion.p>

        <motion.button
          className="mt-6 bg-green-700 px-6 py-3 rounded text-white font-medium hover:bg-green-800 w-fit"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Start Collaborating Now
        </motion.button>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-green-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}