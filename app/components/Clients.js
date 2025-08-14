"use client";

import { motion } from "framer-motion";

export default function Clients() {
  const clients = [
    "/logo1.png",
    "/logo2.png",
    "/logo3.png",
    "/logo4.png",
    "/logo5.png",
    "/logo6.png",
    "/logo7.png",
    "/logo8.png",
    "/logo9.png",
    "/logo10.png",
    "/logo11.png",
    "/logo12.png",
  ];

  // Variants untuk staggered animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1, // delay antar item
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 20 },
  };

  return (
    <section id="clients" className="py-16 bg-[#F3F5F7]">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">

        {/* Left title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-black">
            Our <span className="text-green-700">Clients</span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
            className="mt-2 text-gray-600 uppercase tracking-wide"
          >
            Lorem ipsum blabla bla
          </motion.p>
        </motion.div>

        {/* Right grid logos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          exit="hidden"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 gap-6"
        >
          {clients.map((logo, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <img
                src={logo}
                alt={`Client ${idx}`}
                className="h-12 object-contain"
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}