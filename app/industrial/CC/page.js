import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CCpage() {
  const hydros = [
    {
      img: "/wf/wf-CPE.png",
      title: "CPE Pump (Stainless Steel)",
      specs: [
        "Follow rate : 3,800 litres/min",
        "Dimension : L 2580mm x W 2040mm x H 2100mm",
        "Weight : 2,400kg",
        "Power Supply : 380 - 460 VAC, 50 / 60 Hz"
      ],
    },
    {
      img: "/wf/wf-CPF.png",
      title: "CPF Pumps (Stainless Steel)",
      specs: [
        "Follow rate : 5,000 litres/min",
        "Dimension : L 2000mm x W 1400mm x H 1800mm",
        "Weight : 2,000kg",
        "Power Supply : 380 - 460 VAC, 50 / 60 Hz"
      ],
    },
  ];

  return (
    <div className="bg-white">
      <Navbar />
      {/* Header */}
      <div className="relative h-85 bg-black">
        <Image
          src="/hero-sec-industri.png"
          alt="Hot Oil Flushing"
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <p className="text-lg">Service</p>
          <h1 className="text-4xl font-bold">
            <span className="text-green-500">Chemical</span> Cleaning
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-5xl mx-auto py-8 px-4 text-center text-gray-700">
        <p>
          Chemical cleaning is one of our specialized trade.CESCO's specially design Chemical Cleaning Pump
          have built-in stainless steel tanks, with a capacity and flow rate of up to 3,000 litres and 5,000 litres
          per minute respectively.
        </p>
      </div>

      {/* Hydro */}
      <div className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {hydros.map((hydro, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center hover:shadow-xl transition duration-300"
          >
            <div className="w-full h-[200px] relative">
              <Image
                src={hydro.img}
                alt={hydro.title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-center text-black">
              {hydro.title}
            </h3>
            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {hydro.specs.map((spec, idx) => (
                <li key={idx}>{spec}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Footer />

    </div>
  );
}
