"use client";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "Home", id: "home" },
    { label: "About Us", id: "about" },
    { label: "Our Client", id: "clients" },
    { label: "Service", id: "services" },
    { label: "Certificate", id: "certificate" },
    { label: "Gallery", id: "gallery" },
    { label: "Contact Us", id: "contact" },
  ];

  return (
    <nav className="bg-white shadow fixed w-full z-50">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 flex justify-between items-center py-4 md:py-5">
        
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={50}
            priority
            className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 lg:space-x-8 xl:space-x-7 font-medium">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-green-700 hover:text-green-900 text-sm sm:text-base md:text-sm lg:text-md xl:text-xl transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl sm:text-3xl text-green-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow flex flex-col">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 font-medium text-green-700 text-base sm:text-lg hover:bg-green-50 transition"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
