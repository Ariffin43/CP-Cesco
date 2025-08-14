// app/components/ContactSection.js
import React from "react";

export default function ContactSection() {
  return (
    <section id="contact" className="w-full bg-[#F3F5F7] text-white py-20">
      {/* Wrapper full width */}
      <div className="w-full px-6 lg:px-20 xl:px-32 2xl:px-48">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-green-700 font-medium text-lg">
            Contact <span className="text-black">Us</span>
          </p>
          <h2 className="text-black text-3xl md:text-5xl font-bold mt-2">
            We’d love to <span className="text-green-700">talk to you</span>
          </h2>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card */}
          <div className="bg-white text-black rounded-lg shadow-lg p-8 flex flex-col items-center">
            <div className="text-green-700 text-4xl mb-3">📞</div>
            <h3 className="font-semibold text-xl mb-1">Call Us</h3>
            <p className="text-gray-600 text-lg">+62 778 6000178</p>
          </div>
          {/* Card */}
          <div className="bg-white text-black rounded-lg shadow-lg p-8 flex flex-col items-center">
            <div className="text-green-700 text-4xl mb-3">📧</div>
            <h3 className="font-semibold text-xl mb-1">Email</h3>
            <p className="text-gray-600 text-lg">Salesmarketing@cesco.co.id</p>
          </div>
          {/* Card */}
          <div className="bg-white text-black rounded-lg shadow-lg p-8 flex flex-col items-center">
            <div className="text-green-700 text-4xl mb-3">📍</div>
            <h3 className="font-semibold text-xl mb-1">Batam Kota</h3>
            <p className="text-gray-600 text-lg text-center">
              Intan Industrial Blok B No. 1, Batu Ampar
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side */}
          <div>
            <h3 className="text-green-700 font-bold text-3xl mb-4">Together</h3>
            <p className="text-black text-lg mb-8">
              Share your vision for your next projects with us now. Please contact us for basic
              questions, we’re here to help!
            </p>
            <p className="text-green-700 font-bold text-lg mb-4">LOCATION</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3988.9859693092744!2d104.0131028!3d1.1703665!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d988cf6b78f9a9%3A0xb85768978934ea!2sPT.%20CESCO%20OFFSHORE%20AND%20ENGINEERING!5e0!3m2!1sid!2sid!4v1755163812083!5m2!1sid!2sid"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>

          {/* Right side */}
          <div className="bg-white text-black rounded-lg shadow-lg p-8">
            <h3 className="text-green-700 font-bold text-3xl mb-6">Send Your Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name*"
                  className="border border-green-600 p-3 w-full focus:outline-none focus:border-green-700"
                />
                <input
                  type="email"
                  placeholder="Email*"
                  className="border border-green-600 p-3 w-full focus:outline-none focus:border-green-700"
                />
              </div>
              <input
                type="text"
                placeholder="Subject*"
                className="border border-green-600 p-3 w-full focus:outline-none focus:border-green-700"
              />
              <textarea
                placeholder="Message*"
                rows="5"
                className="border border-green-600 p-3 w-full focus:outline-none focus:border-green-700"
              ></textarea>
              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
