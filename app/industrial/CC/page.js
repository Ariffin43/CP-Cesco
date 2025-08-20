"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CCpage() {
  const hydros = [
    {
      img: "/cc/1.png",
      title: "Centrifugal Pump (Stainless Steel)",
      specs: [
        "Follow rate : 3,800 litres/min",
        "Dimension : L 2580mm x W 2040mm x H 2100mm",
        "Weight : 2,400kg",
        "Power Supply : 380 - 460 VAC, 50 / 60 Hz"
      ],
    },
  ];

  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center">
        <Image
          src="/hero-sec-industri.png"
          alt="Hot Oil Flushing"
          fill
          className="object-cover"
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
          <h1 className="mt-4 text-5xl font-bold">
            <span className="text-green-400">Chemical</span> Cleaning
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-gray-200">
            Precision-engineered hydros to achieve superior cleanliness in piping
            systems.
          </p>
        </motion.div>
      </div>

      {/* Description */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center leading-relaxed">
        <p>
          Chemical cleaning is one of our specialized trade.CESCO's specially design Chemical Cleaning Pump
          have built-in stainless steel tanks, with a capacity and flow rate of up to 3,000 litres and 5,000 litres
          per minute respectively.
        </p>
      </section>

      {/* Hydro */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hydros.map((hydro, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col items-center"
            >
              <div className="w-full h-[200px] relative">
                <Image
                  src={hydro.img}
                  alt={hydro.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {hydro.title}
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-1 text-left w-full">
                {hydro.specs.map((spec, idx) => (
                  <li key={idx}>• {spec}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
