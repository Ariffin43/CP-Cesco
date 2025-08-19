"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaRocket,
  FaClock,
  FaTools,
  FaTruck,
  FaChartLine,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const [desktopServiceOpen, setDesktopServiceOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);


  const servicePaths = [
    "/industrial",
    "/pressureTest",
    "/maintance",
    "/supply-delivery",
    "/integrity-management",
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
        setMobileServiceOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const menuItems = [
    { label: "Home", id: "home", href: "/#home" },
    { label: "About Us", id: "about", href: "/#about" },
    { label: "Our Client", id: "clients", href: "/#clients" },
    {
      label: "Service",
      id: "services",
      subMenu: [
        {
          icon: <FaRocket className="w-5 h-5 text-blue-500" />,
          title: "Industrial Cleaning",
          desc: "Layanan pembersihan skala industri",
          href: "/industrial",
        },
        {
          icon: <FaTools className="w-5 h-5 text-yellow-500" />,
          title: "Maintenance",
          desc: "Perawatan rutin & perbaikan",
          href: "/maintance",
        },
        {
          icon: <FaClock className="w-5 h-5 text-purple-500" />,
          title: "Pressure Test",
          desc: "Pengujian tekanan",
          href: "/pressureTest",
        },
        {
          icon: <FaTruck className="w-5 h-5 text-green-500" />,
          title: "Supply & Delivery",
          desc: "Distribusi peralatan/material",
          href: "/supply-delivery",
        },
        {
          icon: <FaChartLine className="w-5 h-5 text-red-500" />,
          title: "Integrity Management",
          desc: "Manajemen integritas aset",
          href: "/integrity-management",
        },
      ],
    },
    { label: "Certificate", id: "certificate", href: "/certificate" },
    { label: "Gallery", id: "gallery", href: "/#gallery" },
    { label: "Contact Us", id: "contact", href: "/#contact" },
  ];
  
  const isServiceActive = servicePaths.some(path => pathname.startsWith(path));

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white shadow-md border-green-100"
          : "bg-white/10 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="max-w-[3840px] mx-auto px-4 sm:px-2 lg:px-12 2xl:px-24 flex justify-between items-center py-4 md:py-5">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={160}
            height={50}
            priority
            className="w-[120px] md:w-[160px] transition-transform hover:scale-105"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 lg:space-x-6 xl:space-x-8 font-medium relative flex-wrap">
          {menuItems.map((item) =>
            item.subMenu ? (
              <div key={item.id} className="relative group">
                <button
                  className={`flex items-center gap-1 text-md lg:text-md xl:text-lg transition-all duration-200
                    ${
                      isServiceActive
                        ? "text-green-600 font-semibold after:w-full"
                        : scrolled
                        ? "text-green-700 hover:text-green-900"
                        : "text-white hover:text-gray-200"
                    } relative after:absolute after:left-0 after:bottom-[-5px] after:h-[2px] after:w-0 after:bg-green-600 after:transition-all group-hover:after:w-full`}
                >
                  Service
                  <svg
                    className="w-4 h-4 mt-0.5 transition-transform duration-300 group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 bg-white shadow-xl rounded-2xl border border-green-100 w-[700px] max-w-[95vw] p-6 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="grid grid-cols-2 gap-6">
                    {item.subMenu.map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        className={`flex items-start gap-3 p-3 rounded-xl transition
                          ${
                            pathname.startsWith(sub.href)
                              ? "bg-green-100 text-green-800 font-semibold"
                              : "hover:bg-green-50"
                          }`}
                      >
                        <span>{sub.icon}</span>
                        <div>
                          <p
                            className={`font-semibold ${
                              pathname.startsWith(sub.href)
                                ? "text-green-800"
                                : "text-green-700"
                            }`}
                          >
                            {sub.title}
                          </p>
                          <p className="text-sm text-gray-600">{sub.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={`text-base lg:text-lg xl:text-xl relative transition after:absolute after:left-0 after:bottom-[-5px] after:h-[2px] after:w-0 after:bg-green-600 after:transition-all hover:after:w-full
                  ${
                    pathname === item.href
                      ? "text-green-600 font-semibold after:w-full"
                      : scrolled
                      ? "text-green-700 hover:text-green-900"
                      : "text-white hover:text-gray-200"
                  }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md transition"
          >
            {mobileOpen ? (
              <FiX
                size={28}
                className={`${scrolled ? "text-green-700" : "text-white"} transition-colors`}
              />
            ) : (
              <FiMenu
                size={28}
                className={`${scrolled ? "text-green-700" : "text-white"} transition-colors`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden bg-white border-t border-gray-200 p-4 space-y-4 text-left animate-fade-in max-h-[calc(100vh-80px)] overflow-y-auto"
        >
          {menuItems.map((item) =>
            item.subMenu ? (
              <div key={item.id}>
                <button
                  className="flex justify-between items-center w-full font-semibold text-green-700 py-2"
                  onClick={() => setMobileServiceOpen(!mobileServiceOpen)}
                >
                  {item.label}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      mobileServiceOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileServiceOpen && (
                  <div className="mt-2 space-y-2 pl-3 pr-1">
                    {item.subMenu.map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-start gap-3 p-2 rounded-lg transition text-sm
                          ${
                            pathname.startsWith(sub.href)
                              ? "bg-green-100 font-semibold text-green-700"
                              : "text-gray-800 hover:bg-green-50"
                          }`}
                      >
                        <span>{sub.icon}</span>
                        <div>
                          <p className="font-medium">{sub.title}</p>
                          <p className="text-xs text-gray-600">{sub.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block font-medium py-2 ${
                  pathname === item.href
                    ? "text-green-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}