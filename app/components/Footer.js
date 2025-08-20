"use client";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn, FaPhone, FaLocationDot} from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Bagian utama footer */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Logo dan Deskripsi */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <Image src="/logo.png" alt="CESCO Logo" width={140} height={50} />
          <p className="mt-4 text-sm leading-relaxed">
            PT Cesco Offshore and Engineering is a company engaged in 
            engineering, manufacturing, and modern marine solutions. 
            We are committed to providing the best services to clients 
            around the world.
          </p>
        </motion.div>

        {/* Tentang */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">About</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#about" className="hover:text-green-400 transition">About Company</Link></li>
            <li><Link href="/career" className="hover:text-green-400 transition">Career</Link></li>
            <li><Link href="/news" className="hover:text-green-400 transition">News & Article</Link></li>
            <li><Link href="/csr" className="hover:text-green-400 transition">CSR</Link></li>
          </ul>
        </motion.div>

        {/* Layanan */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/industrial" className="hover:text-green-400 transition">Industrial Cleaning</Link></li>
            <li><Link href="/pressureTest" className="hover:text-green-400 transition">Pressure Test</Link></li>
            <li><Link href="/maintance" className="hover:text-green-400 transition">Maintance</Link></li>
            <li><Link href="/supply&delivery" className="hover:text-green-400 transition">Supply & Delivery</Link></li>
            <li><Link href="/intregrity-managament" className="hover:text-green-400 transition">Integrity Managament</Link></li>
          </ul>
        </motion.div>

        {/* Kontak */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
          <p className="text-sm mb-2"><FaLocationDot/> Kawasan Intan Industrial Park Blok B No.1, Batam</p>
          <p className="text-sm mb-2"><FaPhone /> +62 778-600-0178</p>
          <p className="text-sm mb-4"><FaEnvelope/> Salesmarketing@cesco.co.id</p>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-green-400 transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-green-400 transition"><FaInstagram /></a>
            <a href="#" className="hover:text-green-400 transition"><FaXTwitter /></a>
            <a href="#" className="hover:text-green-400 transition"><FaLinkedinIn /></a>
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
        © 2025 PT Cesco Offshore and Engineering. All Rights Reserved.
      </div>
    </footer>
  );
}