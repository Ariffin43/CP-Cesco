"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function HOFPage() {
  const pumps = [ 
    { 
      img: "/hof/1.png", 
      title: "HOF-3000 Pump", 
      specs: [ "Follow rate for single pump : 1450 litres/min", "Follow rate for double pump : 2900 litres/min", "Dimension : L 3200mm x W 2300mm x H 2660mm", "Weight : 5,200kg", "Power Supply : 380~460V / 60hz", ], 
    }, 
    { 
      img: "/hof/2.png", 
      title: "HOF-1000 Pump", 
      specs: [ "Follow rate for single pump : 515 litres/min", "Follow rate for double pump : 1030 litres/min", "Dimension : L 3000mm x W 1800mm x H 2450mm", "Weight : 3,500kg", "Power Supply : 380~460V / 60hz", ],
    }, 
    { 
      img: "/hof/3.png", 
      title: "HOF-500", 
      specs: [ "Follow rate for single pump : 500 litres/min", "Dimension : L 2130mm x W 1470mm x H 2190mm", "Weight : 2,000kg ~ 2,400kg", "Power Supply : 380~460VAC, 50/60hz", ], 
    }, 
    { 
      img: "/hof/4.png", 
      title: "HOF-500 Explosion Proof (Zone-Rated)", 
      specs: [ "Follow rate for single pump : 515 litres/min", "Dimension : L 2130mm x W 1470mm x H 2190mm", "Weight : 2,400kg", "Power Supply : 380~460VAC, 50/60hz", ], 
    }, 
    { 
      img: "/hof/5.png", 
      title: "Water-Glycol Pump (WGP)", 
      specs: [ "Follow rate for single pump : 160 litres/min", "Dimension : L 2150mm x W 1500mm x H 2300mm", "Weight : 3,000kg", "Power Supply : 380~420 VAC, 50hz", ], 
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
            <span className="text-green-400">Hot Oil</span> Flushing
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-gray-200">
            Precision-engineered pumps to achieve superior cleanliness in piping
            systems.
          </p>
        </motion.div>
      </div>

      {/* Description */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center leading-relaxed">
        <p>
          Hot oil flushing is done using flushing or system oil to remove the{" "}
          <span className="font-semibold text-green-600">fouling</span> from the
          internals of the piping systems. Flow is crucial during flushing as it
          determines the{" "}
          <span className="font-semibold text-green-600">cleanliness</span> in
          the piping systems. Our uniquely designed pumps feature fine filters
          and sampling points for online particle counters, ensuring results
          that meet industry standards. We also provide{" "}
          <span className="font-semibold text-green-600">
            complete auxiliary equipment
          </span>{" "}
          for a reliable operation.
        </p>
      </section>

      {/* Pumps */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Our Pump Range
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pumps.map((pump, i) => (
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
                  src={pump.img}
                  alt={pump.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {pump.title}
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-1 text-left w-full">
                {pump.specs.map((spec, idx) => (
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
