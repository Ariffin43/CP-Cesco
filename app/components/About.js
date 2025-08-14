"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function About() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-center text-black"
        >
          About <span className="text-green-700">Cesco</span>
        </motion.h2>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: false, amount: 0.2 }}
          className="flex justify-center mt-8 space-x-3"
        >
          {["about", "vision"].map((tab) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg shadow transition cursor-pointer ${
                activeTab === tab
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {tab === "about" ? "About Us" : "Vision And Mission"}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <div className="mt-14">
          <AnimatePresence mode="wait">
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, amount: 0.2 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="text-gray-700 space-y-5 leading-relaxed"
                >
                  <p>
                    PT. CESCO Offshore and Engineering aims to be the leading provider of
                    mechanical completion and pre-commissioning services in the local and
                    regional maritime, oil, gas, and petrochemical industries.
                  </p>
                  <p>
                    ISO 9000:2015 certification recognizes CESCO’s commitment to service
                    excellence and leadership. The company is also committed to good health,
                    safety, and environmental practices.
                  </p>
                </motion.div>

                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="relative w-full max-w-md mx-auto"
                >
                  <img
                    src="/about1.png"
                    alt="About Cesco"
                    className="w-[80%] h-auto shadow-lg"
                  />
                </motion.div>
              </motion.div>
            )}

            {activeTab === "vision" && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, amount: 0.2 }}
                className="space-y-8"
              >
                {/* Vision */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="flex items-start gap-4 pl-12"
                >
                  <img src="/visi.png" alt="Vision" className="w-32 h-32" />
                  <div>
                    <h3 className="text-green-700 font-bold text-lg">VISION</h3>
                    <p className="text-gray-700">
                      To promote high quality services that meet our customers’ requirements
                      and satisfaction, ensuring protection of the environment, as well as
                      health and safety of all our employees, customers and the community.
                    </p>
                  </div>
                </motion.div>

                {/* Mission */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <img src="/misi.png" alt="Mission" className="w-32 h-32" />
                  <div>
                    <h3 className="text-green-700 font-bold text-lg">MISSION</h3>
                    <p className="text-gray-700">
                      We aim to provide the best professional and world class mechanical
                      completion & pre-commissioning services locally as well as regionally
                      for the Marine, Oil & Gas, Petrochemical and Power Plant Industries.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
