"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceDesktopOpen, setServiceDesktopOpen] = useState(false);
  const serviceRef = useRef(null);
  const pathname = usePathname();

  const menuItems = [
    { label: "Home", id: "home", href: "/#home" },
    { label: "About Us", id: "about", href: "/#about" },
    { label: "Our Client", id: "clients", href: "/#clients" },
    {
      label: "Service",
      id: "services",
      subMenu: [
        { label: "Industrial Cleaning", id: "industrial", href: "/industrial" },
        { label: "Maintenance", id: "maintenance", href: "/maintenance" },
        { label: "Pressure Test", id: "pressure-test", href: "/pressure-test" },
        { label: "Supply & Delivery", id: "supply-delivery", href: "/supply-delivery" },
        { label: "Integrity Management", id: "integrity-management", href: "/integrity-management" },
      ],
    },
    { label: "Certificate", id: "certificate", href: "/#certificate" },
    { label: "Gallery", id: "gallery", href: "/#gallery" },
    { label: "Contact Us", id: "contact", href: "/#contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setServiceDesktopOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow fixed w-full z-50">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 flex justify-between items-center py-4 md:py-5">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={160}
            height={50}
            priority
            className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 lg:space-x-8 font-medium relative">
          {menuItems.map((item) =>
            item.subMenu ? (
              <div key={item.id} className="relative group" ref={serviceRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setServiceDesktopOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-1 text-green-700 hover:text-green-900 text-base xl:text-lg transition-colors"
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 mt-0.5 transition-transform duration-300 ${
                      serviceDesktopOpen ? "rotate-180" : "group-hover:rotate-180"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute left-0 animate-fade-slide bg-white shadow-lg rounded-lg overflow-hidden border border-green-100 min-w-[220px] ${
                    serviceDesktopOpen ? "block" : "hidden group-hover:block"
                  }`}
                >
                  {item.subMenu.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.href || "#"}
                      className={`block px-4 py-2 transition ${
                        pathname === sub.href
                          ? "bg-green-500 text-white"
                          : "text-green-700 hover:bg-green-200"
                      }`}
                      onClick={() => setServiceDesktopOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href || `#${item.id}`}
                className="text-green-700 hover:text-green-900 text-base xl:text-lg transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
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
          {menuItems.map((item) =>
            item.subMenu ? (
              <div key={item.id}>
                <button
                  onClick={() => setServiceOpen((prev) => !prev)}
                  className="flex justify-between w-full px-4 py-3 font-medium text-green-700 hover:bg-green-50 transition"
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 mt-0.5 transition-transform duration-300 ${
                      serviceOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {serviceOpen && (
                  <div className="pl-6 bg-green-50">
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.href || "#"}
                        onClick={() => setOpen(false)}
                        className={`block px-4 py-2 transition ${
                          pathname === sub.href
                            ? "bg-green-600 text-white"
                            : "text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href || `#${item.id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 font-medium text-green-700 hover:bg-green-50 transition"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}

      {/* Animasi dropdown */}
      <style jsx>{`
        @keyframes fade-slide {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-slide {
          animation: fade-slide 0.25s ease-out;
        }
      `}</style>
    </nav>
  );
}
