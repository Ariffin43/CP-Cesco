"use client";

import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const cards = [
    {
      icon: <FaPhoneAlt className="text-green-800 text-xl sm:text-2xl mb-2" />,
      title: "Call Us",
      text: "+62 778 6000178",
    },
    {
      icon: <FaEnvelope className="text-green-800 text-xl sm:text-2xl mb-2" />,
      title: "Email",
      text: "Salesmarketing@cesco.co.id",
    },
    {
      icon: <FaMapMarkerAlt className="text-green-800 text-xl sm:text-2xl mb-2" />,
      title: "Batam Kota",
      text: "Intan Industrial Blok B No. 1, Batu Ampar",
    },
  ];

  return (
    <section id="contact" className="w-full bg-white">
      {/* Bagian Hero */}
      <div className="hidden md:block relative h-[30vh] pt-5">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-30   z-0"
          style={{ backgroundImage: "url('/25.jpg')" }}
        ></div>

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h3 className=" text-3xl font-bold mb-2">
            Contact <span className="text-white">Us</span>
          </h3>
          <h1 className="text-5xl font-bold text-white leading-snug">
            We’d love to <span className="">talk to you</span>
          </h1>
        </motion.div>

        <div className="absolute left-1/2 -bottom-17   transform -translate-x-1/2 flex gap-6 px-4 w-full max-w-5xl z-20">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="bg-white shadow-md flex-1 rounded-lg p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: false, amount: 0.2 }}
            >
              {card.icon}
              <p className="text-black font-bold">{card.title}</p>
              <p className="text-gray-700">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cards versi mobile */}
      <div className="md:hidden px-4 py-6 flex flex-col gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            {card.icon}
            <p className="text-black font-bold text-sm">{card.title}</p>
            <p className="text-gray-700 text-xs">{card.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-32 pb-16 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Info + Map */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-[clamp(1.5rem,2vw,2.25rem)] font-bold mb-3 text-black">
            Let's Work <span className="text-green-800">Together</span>
          </h2>
          <p className="text-gray-700 mb-6 text-[clamp(0.9rem,1.2vw,1rem)]">
            Share your vision for your next projects with us now. Please contact us for basic questions, we’re here to help!
          </p>
          <h3 className="text-[clamp(1.25rem,1.5vw,1.5rem)] font-bold mb-2 text-black">
            OUR <span className="text-green-800">LOCATION</span>
          </h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3988.9862584582597!2d104.01437723412941!3d1.170163189478173!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d988cf6b78f9a9%3A0xb85768978934ea!2sPT.%20CESCO%20OFFSHORE%20AND%20ENGINEERING!5e0!3m2!1sid!2sid!4v1755221849348!5m2!1sid!2sid"
            className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-lg"
            loading="lazy"
          ></iframe>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h3 className="text-[clamp(1.5rem,2vw,2rem)] font-bold text-green-800 mb-4">
            Send Your Message
          </h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name*"
                className="text-gray-500 border border-green-800 rounded p-2 text-[clamp(0.85rem,1vw,1rem)]"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email*"
                className="text-gray-500 border border-green-800 rounded p-2 text-[clamp(0.85rem,1vw,1rem)]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject*"
              className="text-gray-500 border border-green-800 rounded p-2 text-[clamp(0.85rem,1vw,1rem)]"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Message*"
              rows={6}
              className="text-gray-500 border border-green-800 rounded p-2 text-[clamp(0.85rem,1vw,1rem)]"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-green-800 text-white rounded px-6 py-2 w-36 sm:w-40 hover:bg-green-700 transition text-[clamp(0.85rem,1vw,1rem)]"
            >
              Send
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
