"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AboutCesco() {
  const [activeTab, setActiveTab] = useState("about");

  const tabs = [
    { id: "about", label: "About Us" },
    { id: "vision", label: "Vision & Mission" },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side Content */}
        <div>
          <p className="text-green-700 font-medium mb-2">About Cesco</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Our Offshore & Engineering Journey
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            PT. CESCO Offshore and Engineering is committed to becoming a leading 
            provider of mechanical completion and pre-commissioning services across 
            the maritime, oil, gas, and petrochemical industries. With a focus on 
            safety, sustainability, and innovation, we deliver solutions that meet 
            the highest international standards.
          </p>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 text-lg font-medium transition-colors
                  ${activeTab === tab.id ? "text-green-700" : "text-gray-500 hover:text-gray-800"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-green-700"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">10+ Years</h3>
                      <p className="text-gray-600">Experience in Offshore & Engineering</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">100+ Projects</h3>
                      <p className="text-gray-600">Successfully delivered with excellence</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">ISO 9001</h3>
                      <p className="text-gray-600">Certified in Quality Management</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">99% Safety</h3>
                      <p className="text-gray-600">Zero accident commitment</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "vision" && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">Vision</h3>
                    <p className="text-gray-700 leading-relaxed">
                      To be a trusted leader in offshore engineering, delivering world-class 
                      services while prioritizing sustainability and safety.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">Mission</h3>
                    <p className="text-gray-700 leading-relaxed">
                      To provide innovative mechanical completion and pre-commissioning 
                      solutions for maritime, oil & gas, and petrochemical industries, 
                      ensuring efficiency, safety, and environmental responsibility.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="flex justify-center">
          <Image
            src="/ISO.png"
            alt="Certificate Cesco"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>
    </section>
  );
}
