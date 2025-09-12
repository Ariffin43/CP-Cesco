"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

const API_COMPANY = "/api/company-profile";
const API_SERVICES = "/api/services";

function normalizeURL(v) {
  if (!v) return "";
  return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
}

function extractSocialHandle(rawUrl = "", platform = "") {
  try {
    const u = new URL(normalizeURL(rawUrl));
    const segs = u.pathname.split("/").filter(Boolean); // ['in','john-doe'] dll
    if (!segs.length) return null;

    // aturan per platform
    switch (platform) {
      case "instagram":
      case "x": // twitter/x
        return decodeURIComponent(segs[0] || "");
      case "linkedin":
        // /in/username, /company/slug, /school/slug, /showcase/slug
        if (["in", "company", "school", "showcase"].includes(segs[0])) {
          return decodeURIComponent(segs[1] || "");
        }
        return decodeURIComponent(segs[0] || "");
      case "facebook":
        // /username atau /profile.php?id=123
        if (segs[0] === "profile.php") {
          const id = u.searchParams.get("id");
          return id ? `id:${id}` : null;
        }
        return decodeURIComponent(segs[0] || "");
      default:
        return decodeURIComponent(segs[0] || "");
    }
  } catch {
    return null;
  }
}


function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Footer() {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [services, setServices] = useState(null);

  const fallback = useMemo(
    () => ({
      name: "PT Cesco Offshore and Engineering",
      address: "Kawasan Intan Industrial Park Blok B No.1, Batam",
      contactPhone: "+62 778-600-0178",
      emails: ["Salesmarketing@cesco.co.id"],
      social: {
        facebook: "",
        instagram: "",
        x: "",
        linkedin: "",
      },
      about: {
        description:
          "PT Cesco Offshore and Engineering is a company engaged in engineering, manufacturing, and modern marine solutions. We are committed to providing the best services to clients around the world.",
      },
    }),
    []
  );

  const fallbackServices = useMemo(
    () => [
      { id: 1, name: "Industrial Cleaning" },
      { id: 2, name: "Pressure Test" },
      { id: 3, name: "Maintenance" },
      { id: 4, name: "Supply & Delivery" },
      { id: 5, name: "Integrity Management" },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_COMPANY, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data = await res.json();
        if (mounted) setCompany(data);
      } catch {
        if (mounted) setCompany(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const data = company ?? fallback;

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const emails = Array.isArray(data?.emails) && data.emails.length ? data.emails : fallback.emails;

  const socials = {
    facebook: normalizeURL(data?.social?.facebook || ""),
    instagram: normalizeURL(data?.social?.instagram || ""),
    x: normalizeURL(data?.social?.x || ""),
    linkedin: normalizeURL(data?.social?.linkedin || ""),
  };
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingServices(true);
        const res = await fetch(API_SERVICES, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        if (mounted) setServices(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setServices([]);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const servicesList =
    Array.isArray(services) && services.length > 0 ? services : fallbackServices;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <Image src="/logo.png" alt="CESCO Logo" width={140} height={50} />
          <p className="mt-4 text-sm leading-relaxed">
            {data?.about?.description || fallback.about.description}
          </p>
          {loading && (
            <p className="mt-2 text-xs text-gray-500">Loading company profile…</p>
          )}
        </motion.div>

        {/* About */}
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
            <li><Link href="/news" className="hover:text-green-400 transition">News &amp; Article</Link></li>
            <li><Link href="/csr" className="hover:text-green-400 transition">CSR</Link></li>
          </ul>
        </motion.div>

        {/* Services */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>

          {servicesList?.length === 0 ? (
            <p className="text-sm text-gray-400">No services available.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {servicesList.map((s) => {
                const id = s.id ?? s.serviceId; // accept either id or serviceId from API
                const name = s.name || "Service";
                // Link to /services/[serviceId]
                const href = id ? `/services/${encodeURIComponent(id)}` : "#";

                return (
                  <li key={String(id ?? name)}>
                    <Link href={href} className="hover:text-green-400 transition">
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Contact */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>

          {data?.address && (
            <p className="text-sm mb-2 flex items-start gap-2">
              <FaLocationDot className="mt-0.5" />
              <span>{data.address}</span>
            </p>
          )}

          {(data?.contactPhone || fallback.contactPhone) && (
            <p className="text-sm mb-2 flex items-center gap-2">
              <FaPhone />
              <a
                className="hover:text-green-400 transition"
                href={`tel:${(data.contactPhone || fallback.contactPhone).replace(/\s+/g, "")}`}
              >
                {data.contactPhone || fallback.contactPhone}
              </a>
            </p>
          )}

          {/* Multiple emails */}
          {emails.map((em, idx) => (
            <p key={idx} className="text-sm mb-2 flex items-center gap-2">
              <FaEnvelope />
              <a className="hover:text-green-400 transition" href={`mailto:${em}`}>
                {em}
              </a>
            </p>
          ))}

          {/* Socials */}
          <div className="flex flex-wrap gap-4 text-xl mt-4">
            {[
              { key: "facebook", Icon: FaFacebookF, labelPrefix: "" },
              { key: "instagram", Icon: FaInstagram, labelPrefix: "@" },
              { key: "x",        Icon: FaXTwitter, labelPrefix: "@" },
              { key: "linkedin", Icon: FaLinkedinIn, labelPrefix: "" },
            ].map(({ key, Icon, labelPrefix }) => {
              const href = socials[key];
              if (!href) return null;
              const handle = extractSocialHandle(href, key);

              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-green-400 transition text-base"
                  aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  <Icon className="text-xl" />
                  {handle && (
                    <span className="text-sm truncate max-w-[160px]">
                      {labelPrefix}{handle}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} {data?.name || fallback.name}. All Rights Reserved.
      </div>
    </footer>
  );
}
