"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  const slides = [
    { src: "/4.jpg", alt: "Slide 1" },
    { src: "/3.jpg", alt: "Slide 2" },
    { src: "/2.jpg", alt: "Slide 3" },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
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
      <div className="absolute inset-0 bg-black/60 flex flex-col justify-center 
      px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-28 text-white z-10">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Your Trusted Partner in<br />Maritime & Energy Solutions
        </motion.h1>

        <motion.p
          className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          PT. CESCO Offshore and Engineering aims to be the leading provider of mechanical completion and pre-commissioning services
          in the local and regional maritime, oil, gas, and petrochemical industries.
          <br />
          ISO 9000:2015 certification recognizes CESCO's commitment to service excellence and leadership. 
          The company is also committed to good health, safety, and environmental practices.
        </motion.p>

        <motion.button
          className="mt-6 bg-green-700 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 rounded text-white font-medium hover:bg-green-800 w-fit text-sm sm:text-base md:text-lg cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
              index === current ? "bg-green-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
