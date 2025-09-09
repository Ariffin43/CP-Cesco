"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTools } from "react-icons/fa";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const [services, setServices] = useState([]);

  const pathname = usePathname();
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
        setMobileServiceOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileServiceOpen(false);
      }
    }

    if (mobileOpen) {
      document.body.classList.add("overflow-hidden");
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onKey);
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setServices([]);
      }
    })();
  }, []);

  const menuItems = [
    { label: "Home", id: "home", href: "/#home" },
    { label: "About Us", id: "about", href: "/#about" },
    { label: "Our Client", id: "clients", href: "/#clients" },
    { label: "Service", id: "services", subMenu: true },
    { label: "Certificate", id: "certificate", href: "/certificate" },
    { label: "Gallery", id: "gallery", href: "/#gallery" },
    { label: "Contact Us", id: "contact", href: "/#contact" },
  ];

  const baseText = scrolled ? "text-green-800" : "text-white";
  const hoverText = scrolled ? "hover:text-green-900" : "hover:text-gray-200";

  const linkUnderline = "relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur border-green-100 shadow-md"
          : "bg-white/10 backdrop-blur-md border-transparent"
      }`}
      role="navigation"
      aria-label="Main"
    >
      {/* Container */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Row */}
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Logo */}
          <Link href="/" aria-label="Company Home" className="shrink-0 group">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={160}
              height={50}
              priority
              className="w-[120px] md:w-[160px] h-auto transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 120px, 160px"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {/* Links */}
            <div className="hidden md:flex items-center gap-6">
              {menuItems.map((item) =>
                item.subMenu ? (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      className={`flex items-center gap-1 text-base lg:text-lg transition-colors cursor-pointer ${baseText} ${hoverText} ${linkUnderline}`}
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Service
                      <FiChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-300 group-hover:rotate-180" />
                    </button>

                    {/* Mega dropdown */}
                    <div
                      className="invisible absolute left-1/2 z-50 mt-3 w-[720px] max-w-[95vw] -translate-x-1/2 rounded-2xl border border-green-100 bg-white p-6 opacity-0 shadow-xl transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                      role="menu"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {services.length === 0 ? (
                          <p className="text-gray-500">Loading…</p>
                        ) : (
                          services.map((svc) => (
                            <Link
                              key={svc.id}
                              href={`/services/${svc.id}`}
                              className={`group/item flex items-start gap-3 rounded-xl p-3 transition-all ${
                                pathname?.startsWith(`/services/${svc.id}`)
                                  ? "bg-green-100 text-green-800 ring-1 ring-green-200"
                                  : "hover:bg-green-50 hover:shadow-md hover:-translate-y-0.5"
                              }`}
                              role="menuitem"
                            >
                              <span className="w-8 h-8 shrink-0 grid place-items-center">
                                {svc.icon ? (
                                  <Image
                                    src={svc.icon}
                                    alt={svc.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover/item:scale-110"
                                  />
                                ) : (
                                  <FaTools className="h-6 w-6 text-green-600 transition-transform duration-300 group-hover/item:scale-110" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-green-700">
                                  {svc.name}
                                </p>
                                <p className="line-clamp-2 text-sm text-gray-600">
                                  {svc.desc}
                                </p>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`text-base lg:text-lg transition-colors ${baseText} ${hoverText} ${linkUnderline} ${
                      pathname === item.href ? "font-semibold text-green-600" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Login */}
            <Link
              href="/Login"
              className="rounded-xl bg-green-600 px-5 py-2 text-base lg:text-lg font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Login
            </Link>
          </div>

          {/* Mobile Toggle + Login */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/Login"
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-green-700 active:scale-95"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-md p-2 transition-colors active:scale-95"
            >
              {mobileOpen ? (
                <FiX
                  size={28}
                  className={`${scrolled ? "text-green-800" : "text-white"} transition-colors`}
                />
              ) : (
                <FiMenu
                  size={28}
                  className={`${scrolled ? "text-green-800" : "text-white"} transition-colors`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-h-[calc(100vh-80px)] overflow-y-auto space-y-2">
              {menuItems.map((item) =>
                item.subMenu ? (
                  <div key={item.id} className="pt-2">
                    <button
                      type="button"
                      aria-expanded={mobileServiceOpen}
                      aria-controls="mobile-services-panel"
                      onClick={() => setMobileServiceOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left font-semibold text-green-700"
                    >
                      {item.label}
                      <svg
                        className={`h-5 w-5 transition-transform ${
                          mobileServiceOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        fill="none"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {mobileServiceOpen && (
                      <div
                        id="mobile-services-panel"
                        className="mt-2 space-y-2 rounded-lg bg-green-50/50 p-2"
                      >
                        {services.length === 0 ? (
                          <p className="px-2 py-1 text-sm text-gray-600">
                            Loading…
                          </p>
                        ) : (
                          services.map((svc) => (
                            <Link
                              key={svc.id}
                              href={`/services/${svc.id}`}
                              onClick={() => setMobileOpen(false)}
                              className={`group/mobile flex items-start gap-3 rounded-lg p-2 text-sm transition-all ${
                                pathname?.startsWith(`/services/${svc.id}`)
                                  ? "bg-green-100 font-semibold text-green-700"
                                  : "text-gray-800 hover:bg-green-100/60 hover:-translate-y-0.5"
                              }`}
                            >
                              <span className="h-8 w-8 shrink-0 grid place-items-center">
                                {svc.icon ? (
                                  <Image
                                    src={svc.icon}
                                    alt={svc.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover/mobile:scale-110"
                                  />
                                ) : (
                                  <FaTools className="h-6 w-6 text-green-600 transition-transform duration-300 group-hover/mobile:scale-110" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate">{svc.name}</p>
                                <p className="line-clamp-2 text-xs text-gray-600">
                                  {svc.desc}
                                </p>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-2 py-2 font-medium transition-all ${
                      pathname === item.href
                        ? "text-green-700"
                        : "text-gray-800 hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
