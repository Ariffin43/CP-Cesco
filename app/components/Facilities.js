"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";

const API_BASE = "/api/facilities";

function chunk2(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

export default function OurFacilitiesSection() {
  const trackRef = useRef(null);
  const colRefs = useRef([]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasOverflow, setHasOverflow] = useState(false);
  const [atEnds, setAtEnds] = useState({ atStart: true, atEnd: false });

  // paging-aware states
  const [stepWidth, setStepWidth] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const [reducedMotion, setReducedMotion] = useState(false);

  // Lightbox state
  const [previewIdx, setPreviewIdx] = useState(null);
  const previewOpen = previewIdx !== null;
  const current = previewOpen ? items[previewIdx] : null;

  // ambil data dari API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE, { cache: "no-store" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const mapped = (Array.isArray(data) ? data : []).map((d) => ({
          id: d.id,
          name: d.title || "Untitled",
          short: d.desc || "",
          image: d.imageUrl,
        }));

        setItems(mapped);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
        setTimeout(() => recalcLayout(), 0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const columns = useMemo(() => chunk2(items), [items]);

  // map id -> index (buat buka preview dari kartu)
  const idToIndex = useMemo(() => {
    const m = new Map();
    items.forEach((it, i) => m.set(it.id, i));
    return m;
  }, [items]);

  // prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(!!mq.matches);
    const onChange = (e) => setReducedMotion(!!e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Recalc layout: stepWidth, itemsPerView, atEnds, activePage
  const recalcLayout = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const overflow = el.scrollWidth > el.clientWidth + 4;
    setHasOverflow(overflow);

    const firstCol = colRefs.current[0];
    if (firstCol) {
      const cs = window.getComputedStyle(el);
      const gap =
        parseFloat(cs.getPropertyValue("column-gap")) ||
        parseFloat(cs.getPropertyValue("gap")) ||
        24;

      const step = firstCol.offsetWidth + gap;
      setStepWidth(step > 0 ? step : firstCol.offsetWidth);

      const ipv = Math.max(1, Math.round((el.clientWidth + gap) / (step || 1)));
      setItemsPerView(ipv);

      const page = Math.round(el.scrollLeft / (step || 1));
      setActivePage(page);
    }

    setAtEnds({
      atStart: el.scrollLeft <= 2,
      atEnd: Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    recalcLayout();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      if (stepWidth > 0) {
        const page = Math.round(el.scrollLeft / stepWidth);
        setActivePage(page);
      }
      setAtEnds({
        atStart: el.scrollLeft <= 2,
        atEnd: Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 2,
      });
    };

    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", recalcLayout);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalcLayout);
    };
  }, [recalcLayout, stepWidth]);

  const pages = Math.max(1, Math.ceil(columns.length / itemsPerView));

  const scrollToPage = (pageIdx) => {
    const el = trackRef.current;
    if (!el || stepWidth <= 0) return;
    const left = pageIdx * stepWidth;
    el.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const scrollByPage = (dir = 1) => {
    const target = Math.min(pages - 1, Math.max(0, activePage + dir));
    scrollToPage(target);
  };

  // Lightbox helpers
  const openPreviewById = (id) => {
    const idx = idToIndex.get(id);
    if (idx !== undefined) setPreviewIdx(idx);
  };
  const closePreview = () => setPreviewIdx(null);
  const prevPreview = () => setPreviewIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  const nextPreview = () => setPreviewIdx((i) => (i === null ? i : (i + 1) % items.length));

  // keyboard: Esc to close, arrows to navigate
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") prevPreview();
      if (e.key === "ArrowRight") nextPreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  return (
    <section id="facilities" className="relative mx-auto w-full bg-white px-4 py-12 sm:py-16 lg:py-20">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-sm font-medium tracking-widest text-emerald-700">OUR FACILITIES</p>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Featured Company Facilities
        </h2>
        <p className="mt-3 text-neutral-600">Explore our facilities through the gallery below.</p>
      </div>

      {/* States */}
      {error && (
        <p className="mt-6 text-center text-rose-600">Failed to load facilities: {error}</p>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-60 rounded-2xl bg-neutral-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-neutral-50 p-6 text-center text-neutral-600">
          No facilities yet.
        </div>
      ) : (
        <>
          {/* Slider */}
          <div className="relative mt-8 max-w-[2560px]">
            {/* edge gradients */}
            {hasOverflow && !atEnds.atStart && (
              <div aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 h-full w-4 bg-gradient-to-r from-white to-transparent" />
            )}
            {hasOverflow && !atEnds.atEnd && (
              <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 h-full w-4 bg-gradient-to-l from-white to-transparent" />
            )}

            {/* track */}
            <div
              ref={trackRef}
              role="region"
              aria-label="Facilities carousel"
              tabIndex={0}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] focus:outline-none"
              style={{ scrollbarWidth: "none" }}
              onWheel={(e) => {
                const el = trackRef.current;
                if (!el) return;
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  el.scrollLeft += e.deltaY;
                  e.preventDefault();
                }
              }}
            >
              {columns.map((pair, idx) => (
                <div
                  key={idx}
                  ref={(node) => (colRefs.current[idx] = node)}
                  className="snap-start shrink-0 min-w-[88%] sm:min-w-[48%] xl:min-w-[32%]"
                >
                  <div className="grid grid-rows-2 gap-6">
                    {pair.map((item) => (
                      <figure
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-600"
                      >
                        <div className="relative aspect-[16/10] w-full">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 48vw, 32vw"
                            priority={idx === 0}
                          />
                        </div>
                        {(item.name || item.short) && (
                          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/40 via-white/30 to-transparent px-4 pb-3 pt-10">
                            <div className="rounded-xl bg-black/40 px-3 py-2 text-white backdrop-blur-xs">
                              {item.name && <h3 className="text-sm font-semibold">{item.name}</h3>}
                              {item.short && (
                                <p className="mt-0.5 text-[13px] leading-snug text-white/85">{item.short}</p>
                              )}
                            </div>
                          </figcaption>
                        )}
                        {/* Tombol overlay untuk buka preview */}
                        <button
                          type="button"
                          aria-label={`Open ${item.name}`}
                          onClick={() => openPreviewById(item.id)}
                          className="absolute inset-0 cursor-zoom-in focus:outline-none"
                        />
                      </figure>
                    ))}
                    {pair.length === 1 && <span aria-hidden className="hidden" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            {hasOverflow && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between">
                <button
                  aria-label="Previous"
                  onClick={() => scrollByPage(-1)}
                  disabled={activePage <= 0}
                  className="pointer-events-auto mx-2 rounded-full border text-black border-neutral-200 bg-gray-300 p-2 shadow hover:bg-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-800 cursor-pointer"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  aria-label="Next"
                  onClick={() => scrollByPage(1)}
                  disabled={activePage >= pages - 1}
                  className="pointer-events-auto mx-2 rounded-full border text-black border-neutral-200 bg-gray-300 p-2 shadow hover:bg-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-800 cursor-pointer"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Dots berbasis pages */}
          {hasOverflow && pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => scrollToPage(i)}
                  className={
                    "h-2 rounded-full transition-all " +
                    (i === activePage ? "w-6 bg-emerald-600" : "w-2 bg-neutral-300 hover:bg-neutral-400")
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Lightbox / Preview Modal */}
      {previewOpen && current && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${current.name}`}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              aria-label="Close preview"
              onClick={closePreview}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-red-500 p-2 shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Nav buttons */}
            {items.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={prevPreview}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  aria-label="Next image"
                  onClick={nextPreview}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.name}
                className="w-full max-h-[82vh] object-contain rounded-xl bg-black/20"
              />
            </div>

            {/* Caption */}
            {(current.name || current.short) && (
              <div className="mt-3 text-center">
                {current.name && <h3 className="text-white text-lg font-semibold">{current.name}</h3>}
                {current.short && <p className="text-white/80 text-sm mt-1">{current.short}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* hide WebKit scrollbar visuals ONLY for the track */}
      <style jsx global>{`
        .scroll-smooth::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
