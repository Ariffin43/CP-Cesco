"use client";

import { motion } from "framer-motion";
import {
  FaLightbulb,
  FaShieldAlt,
  FaHandsHelping,
  FaLeaf,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

export default function Service() {
  const services = [
    {
      icon: <FaLightbulb size={30} />,
      title: "Creativity",
      desc: "We provide an open, trusting, and innovative work environment that encourages new ideas.",
    },
    {
      icon: <FaClock size={30} />,
      title: "Always Operating",
      desc: "We are available 365 days a year. We are here to respond to your needs.",
    },
    {
      icon: <FaFileAlt size={30} />,
      title: "Capability",
      desc: "We simplify and optimize processes to ensure fast, safe, and quality performance.",
    },
    {
      icon: <FaShieldAlt size={30} />,
      title: "Safety First",
      desc: "We comply with the highest and safest standards in the industry.",
    },
    {
      icon: <FaHandsHelping size={30} />,
      title: "Care",
      desc: "Our motto is 'Safety First'. We provide sustainable and environmentally friendly systems.",
    },
    {
      icon: <FaLeaf size={30} />,
      title: "Core Value",
      desc: "Our values are respect, integrity, trust, accountability, and responsibility.",
    },
  ];

  // Variants untuk animasi grid
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.95 },
  };

  return (
    <section className="py-20 w-full mx-auto px-4 bg-[#F3F5F7]">
      {/* Title */}
      <motion.h2
        className="text-3xl font-bold mb-6 text-center text-black"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        Why Use <span className="text-green-700">Cesco</span> Service
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-center max-w-2xl mx-auto mb-12 text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        Our company has earned the trust of our clients with more than 15 years
        of experience in the maritime, oil, gas, and petrochemical industries.
      </motion.p>

      {/* Grid Services */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        exit="hidden"
        viewport={{ once: false, amount: 0.2 }}
      >
        {services.map((item, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            transition={{ duration: 0.4 }}
            className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg hover:scale-105 transition-transform"
          >
            <div className="text-green-700 mb-4 flex justify-center">
              {item.icon}
            </div>
            <h4 className="font-bold mb-2 text-black">{item.title}</h4>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}