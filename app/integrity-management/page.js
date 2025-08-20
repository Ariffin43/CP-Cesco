"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function integrityManagement() {
  const services = [
    {
      title: "Flange Managament",
      img: "/im/1.png",
      href: "/integrity/FM",
    },
    {
      title: "Nitrogen Helim Test",
      img: "/im/2.png",
      href: "/integrity/NHT",
    },
    {
      title: "Nitrogen Purging",
      img: "/im/3.png",
      href: "/integrity/NP",
    },
    {
      title: "Preservation",
      img: "/im/4.png",
      href: "/integrity/PV",
    },
  ];

  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[80vh] flex items-center justify-center">
        <Image
          src="/hero-sec-industri.png"
          alt="Industrial Cleaning"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white"
        >
          <span className="px-4 py-1 bg-green-500/80 rounded-full text-sm tracking-wide">
            Service
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold">
            <span className="text-green-400">Integrity</span> Management
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-200">
            Advanced solutions to ensure cleanliness, efficiency, and reliability
            across industrial systems.
          </p>
        </motion.div>
      </div>

      {/* Integrity */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={service.href}
                className="bg-white border rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center"
              >
                <div className="w-full h-[200px] relative">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {service.desc}
                </p>
                <button className="mt-5 w-12 h-12 flex items-center justify-center rounded-full border border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition">
                  →
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}