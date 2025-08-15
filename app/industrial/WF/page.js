import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function WFpage() {
  const hydros = [
    {
      img: "/WF/circulating.png",
      title: "Circulating Pumps",
      specs: [
        "Follow rate : 5,000 litres/min",
        "Dimension : L 2100mm x W 1830mm x H 1400mm",
        "Weight : 2,000kg",
        "Power Supply : 380 - 415 VAC, 50 / 60 Hz"
      ],
    },
    {
      img: "/WF/Floading.png",
      title: "Floading Pump",
      specs: [
        "Follow rate : 2,000 SCF/min",
        "Dimension : L 5000mm x W 2100mm x H 2000mm",
        "Weight : 10,000kg",
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
            <span className="text-green-500">Water</span> Flushing
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-5xl mx-auto py-8 px-4 text-center text-gray-700">
        <p>
          Hydro-Jetting/Retro-Jetting: Hydro-jetting is usually the first approach to clear 
          the blockage from the inside of pipes (50mm to 1,000mm). CESCO has a range of hydro-jetting 
          equipment c/w centralizers at various operating pressures, which engage spinning nozzles to clean the pipes. 
          Roto-Car/Roto-Fan: CESCO has a Roto-Car system which is able to remove difficult incrustations from the inside of pipes 
          (150mm to 1,000mm bore) in a fast and efficient manner with greater flexibility. It rotates the hose, allowing the nozzle 
          to jet the high-pressure water around the internal surface of the pipe. The feed unit will feed or pull the hose automatically 
          in or out of the pipe.
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
