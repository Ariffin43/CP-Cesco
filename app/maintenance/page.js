import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

export default function Maintenance() {
  const services = [
    {
      title: "Hot Oil Flushing",
      img: "/services/hot-oil-flushing.png",
      href: "/industrial/HOF",
    },
    {
      title: "Hydro Jetting",
      img: "/services/hydro-jetting.png",
      href: "/industrial/HJ",
    },
    {
      title: "Water Flushing",
      img: "/services/water-flushing.png",
      href: "/industrial/WF",
    },
    {
      title: "Chemical Cleaning",
      img: "/services/chemical-cleaning.png",
      href: "/industrial/CC",
    },
    {
      title: "Boiler Cleaning",
      img: "/services/boiler-cleaning.png",
      href: "/industrial/BC",
    },
    {
      title: "Dessicant Drying",
      img: "/services/dessicant-drying.png",
      href: "/industrial/DD",
    },
  ];

  return (
    <div className="bg-white text-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full">
        <div className="flex h-[250px] md:h-[350px]">
          {/* Left image */}
          <div className="relative flex-1">
            <Image
              src="/hero-sec-industri.png"
              alt="Industrial Left"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Overlay text */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
            <h2 className="text-white text-lg md:text-xl">Service</h2>
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-green-600">Industrial</span>{" "}
              <span className="text-white">Cleaning</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <Link
            key={index}
            href={service.href}
            className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-full h-[200px] relative">
              <Image
                src={service.img}
                alt={service.title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{service.title}</h3>
            <button className="mt-3 w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-green-700 hover:text-white transition">
              →
            </button>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}