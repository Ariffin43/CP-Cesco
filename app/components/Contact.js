"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPhone, FiMail, FiMapPin, FiCopy, FiCheck, FiClock, FiArrowRight,
} from "react-icons/fi";

export default function ContactModern() {
  const [copied, setCopied] = useState({ phone: false, email: false });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [err, setErr] = useState({});

  const contact = {
    phone: "+62 778 6000178",
    email: "Salesmarketing@cesco.co.id",
    address: "Intan Industrial Blok B No.1, Batu Ampar, Batam",
    mapLink: "https://maps.google.com/?q=PT.%20CESCO%20OFFSHORE%20AND%20ENGINEERING",
  };

  const cards = [
    { k: "phone", icon: <FiPhone />, label: "Call Us", value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}` },
    { k: "email", icon: <FiMail />, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { k: "map",   icon: <FiMapPin />, label: "Address", value: contact.address, href: contact.mapLink },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
  };

  const onCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1200);
    } catch {}
  };

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Min. 10 characters";
    setErr(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSent(false);
    if (!validate()) return;
    setSending(true);
    // TODO: ganti ke fetch("/api/contact", {method:"POST", body: JSON.stringify(form)})
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 2500);
    }, 900);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14 pt-16 sm:pt-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-3 py-1 text-emerald-700 text-xs sm:text-sm backdrop-blur">
            <FiClock /> Mon–Sat 08:00–17:00 (WIB)
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black text-black">
            Let’s <span className="text-green-700">build something</span> great together
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Reach out for project inquiries, partnerships, or general questions.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-10 2xl:px-14 pb-16 sm:pb-20">
        <div className="mx-auto max-w-[2560px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-10">
          {/* Left column: Contact cards + Map */}
          <div className="lg:col-span-5 space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((c, i) => (
                <motion.div
                  key={c.k}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  className="relative rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      {c.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-emerald-900">{c.label}</p>
                      <a
                        href={c.href}
                        className="block text-sm text-emerald-700 hover:text-emerald-900 truncate"
                        title={c.value}
                      >
                        {c.value}
                      </a>
                    </div>
                  </div>

                  {["phone", "email"].includes(c.k) && (
                    <button
                      type="button"
                      onClick={() => onCopy(c.value, c.k)}
                      className="cursor-pointer absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                    >
                      {copied[c.k] ? (<><FiCheck /> Copied</>) : (<><FiCopy /> Copy</>)}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Map card */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              className="rounded-2xl border border-emerald-100 overflow-hidden bg-white/70 backdrop-blur shadow-[0_12px_40px_-20px_rgba(16,185,129,0.45)]"
            >
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Our Location</p>
                  <a
                    href={contact.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-700 hover:text-emerald-900"
                  >
                    Open in Google Maps <FiArrowRight className="inline ml-1" />
                  </a>
                </div>
              </div>
              <div className="h-64 sm:h-72 md:h-80">
                <iframe
                  title="CESCO Location"
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent("PT. CESCO OFFSHORE AND ENGINEERING")}&output=embed`}
                />
              </div>
            </motion.div>
          </div>

          {/* Right column: Form */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-5 sm:p-6 lg:p-8 shadow-[0_20px_70px_-30px_rgba(16,185,129,0.55)]">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-800">Send us a message</h3>
              <p className="mt-1 text-gray-600 text-sm">
                We typically respond within 1–2 business days.
              </p>

              {sent && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm" role="status" aria-live="polite">
                  Thanks! Your message has been sent.
                </div>
              )}

              <form onSubmit={onSubmit} noValidate className="mt-5 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Full name*"
                    value={form.name}
                    onChange={onChange}
                    error={err.name}
                  />
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email*"
                    value={form.email}
                    onChange={onChange}
                    error={err.email}
                  />
                </div>

                <Field
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Subject*"
                  value={form.subject}
                  onChange={onChange}
                  error={err.subject}
                />

                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your project*"
                  rows={7}
                  value={form.message}
                  onChange={onChange}
                  error={err.message}
                />

                <button
                  type="submit"
                  disabled={sending}
                  className={`cursor-pointer inline-flex items-center justify-center rounded-xl
                             px-6 py-3 font-semibold text-white transition
                             ${sending ? "bg-gray-400" : "bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-300"}`}
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* inputs */
function Field({ id, name, type, placeholder, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2
          ${error ? "border-red-400 focus:ring-red-300" : "border-emerald-200 focus:border-emerald-700 focus:ring-emerald-200"}`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Textarea({ id, name, placeholder, rows, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2
          ${error ? "border-red-400 focus:ring-red-300" : "border-emerald-200 focus:border-emerald-700 focus:ring-emerald-200"}`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}