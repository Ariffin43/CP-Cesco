"use client";

import { motion } from "framer-motion";

export default function Clients() {
  const clients = [
    "/logo1.png","/logo2.png","/logo3.png","/logo4.png","/logo5.png","/logo6.png",
    "/logo7.png","/logo8.png","/logo9.png","/logo10.png","/logo11.png","/logo12.png",
    "/logo13.png","/logo14.png","/logo15.png","/logo16.png","/logo17.png","/logo18.png","/logo19.png",
  ];

  return (
    <section id="clients" className="w-full bg-[#F3F5F7] py-16 sm:py-20">
      <div className="mx-auto px-6">
        {/* Title & Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-black sm:text-4xl">
            Our <span className="text-green-700">Clients</span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-3 max-w-3xl text-[15px] leading-7 text-gray-600 sm:text-base"
          >
            Trusted by renowned clients in the maritime, energy, and petrochemical industries.
            We keep strengthening partnerships by delivering innovative solutions and consistent project excellence.
          </motion.p>
        </motion.div>

        {/* Marquee (no pause on hover) */}
        <div className="relative mt-10 overflow-hidden" role="region" aria-label="Our clients logos">
          {/* edge gradients */}
          <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#F3F5F7] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#F3F5F7] to-transparent" />

          {/* track wrapper with CSS variable for speed */}
          <div className="marquee">
            <div className="marquee-track flex w-max items-center gap-12 will-change-transform">
              {/* list 1 */}
              <ul className="flex shrink-0 items-center gap-12">
                {clients.map((logo, i) => (
                  <li key={i} className="flex items-center justify-center">
                    <img
                      src={logo}
                      alt={`Client ${i + 1}`}
                      className="h-10 w-auto opacity-80 transition-opacity duration-200 hover:opacity-100 sm:h-12"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  </li>
                ))}
              </ul>
              {/* duplicated list for seamless loop */}
              <ul className="flex shrink-0 items-center gap-12" aria-hidden="true">
                {clients.map((logo, i) => (
                  <li key={`dup-${i}`} className="flex items-center justify-center">
                    <img
                      src={logo}
                      alt=""
                      className="h-10 w-auto opacity-80 transition-opacity duration-200 hover:opacity-100 sm:h-12"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CSS: smooth infinite scroll, NO hover pause, adaptive speed, reduced-motion fallback */}
      <style jsx global>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* base speed (mobile) */
        .marquee { --marquee-duration: 28s; }
        /* tablet a bit slower */
        @media (min-width: 640px) {
          .marquee { --marquee-duration: 34s; }
        }
        /* desktop slowest for elegance */
        @media (min-width: 1024px) {
          .marquee { --marquee-duration: 40s; }
        }
        .marquee-track {
          animation: marqueeScroll var(--marquee-duration) linear infinite;
        }
        /* Accessibility: respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
