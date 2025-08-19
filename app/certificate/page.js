"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

const certificates = [
  { src: "/sertif1.jpg", desc: "ISO 9001 Quality Management" },
  { src: "/sertif2.jpg", desc: "ISO 14001 Environmental Management" },
  { src: "/sertif3.jpg", desc: "OHSAS 18001 Safety Standard" },
  { src: "/sertif4.jpg", desc: "Offshore Engineering Training" },
  { src: "/sertif5.jpg", desc: "Mechanical Completion Certificate" },
  { src: "/sertif6.jpg", desc: "Pre-Commissioning Excellence Award" },
  { src: "/sertif7.jpg", desc: "Pre-Commissioning Excellence Award" },
  { src: "/sertif8.jpg", desc: "Pre-Commissioning Excellence Award" },
  { src: "/sertif9.jpg", desc: "Pre-Commissioning Excellence Award" },
];

export default function Certificate() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <div className="bg-white text-gray-800">
      <Navbar />

        {/* Hero Section */}
        <section
        className="relative w-full h-[40vh] md:h-[60vh] flex items-center justify-center text-center"
        style={{
            backgroundImage: "url('/sertif.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}
        >

            {/* Overlay gelap */}
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative text-white px-4">
                <motion.h1
                className="text-4xl text-green-400 md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                >
                Certificate <span className="text-white">and</span> Recognition
                </motion.h1>
                <motion.p
                className="text-lg md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                >
                Our company is proud to be certified and recognized by industry leaders
                for our commitment to quality and excellence
                </motion.p>
            </div>
        </section>

        {/* Certificate Grid */}
        <section className="w-full py-20 bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {certificates.map((item, index) => (
                    <motion.div
                        key={index}
                        className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                        src={item.src}
                        alt={`Certificate ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Hover description */}
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-sm p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.desc}
                        </div>
                    </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeLightbox();
                    }}
                    >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl z-10"
                        onClick={closeLightbox}
                    >
                        <FaTimes />
                    </button>
                    <div className="relative w-[100vh] h-[100vh]">
                        <Image
                        src={certificates[lightboxIndex].src}
                        alt={`Certificate ${lightboxIndex + 1}`}
                        fill
                        className="object-contain rounded-lg"
                        />
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>

      <Footer />
    </div>
  );
}