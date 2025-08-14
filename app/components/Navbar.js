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
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={120} height={40} priority />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 font-medium">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-green-700 hover:text-green-900"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl text-green-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 font-medium text-green-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
