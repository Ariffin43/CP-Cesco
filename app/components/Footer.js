"use client";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

export default function Footer() {
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-gray-200 text-black">
      {/* Bagian atas */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-end items-center px-4 sm:px-8 py-2 text-xs sm:text-sm text-center md:text-right"
      >
        <p className="order-2 md:order-1 mt-2 md:mt-0">
          Copyright © 2025 PT Cesco Offshore and Engineering
        </p>
      </motion.div>

      {/* Bagian bawah */}
      <div className="border-t border-black flex flex-col md:flex-row justify-between px-4 sm:px-8 py-6 items-center md:items-start gap-6 w-full">
        
        {/* Logo */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-shrink-0 flex justify-center md:justify-start"
        >
          <Image src="/logo.png" alt="CESCO Logo" width={120} height={40} />
        </motion.div>

        {/* Info Kontak */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col text-xs sm:text-sm gap-4 w-full md:w-auto"
        >
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
            <p className="font-bold min-w-[60px]">Alamat</p>
            <p className="max-w-md">
              Kawasan Intan Industrial Park Blok B No.1. Melcem, Tj. Sengkuang,
              Kec. Batu Ampar, Kota Batam, Kepulauan Riau, Indonesia
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
            <p className="font-bold min-w-[60px]">Kontak</p>
            <p>62 811-9442-896</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
            <p className="font-bold min-w-[60px]">Email</p>
            <div className="flex flex-col">
              <p>Salesmarketing@cesco.co.id</p>
              <p>Salesmarketing2@cesco.co.id</p>
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center md:justify-end gap-4 text-xl sm:text-2xl"
        >
          <a href="#" className="hover:text-green-800 transition">
            <FaFacebookF />
          </a>
          <a href="#" className="hover:text-green-800 transition">
            <FaInstagram />
          </a>
          <a href="#" className="hover:text-green-800 transition">
            <FaXTwitter />
          </a>
        </motion.div>
      </div>
    </footer>
  );
}