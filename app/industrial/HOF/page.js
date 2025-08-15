import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function HOFPage() {
  const pumps = [
    {
      img: "/hof/hof-3000.png",
      title: "HOF-3000 Pump",
      specs: [
        "Follow rate for single pump : 1450 litres/min",
        "Follow rate for double pump : 2900 litres/min",
        "Dimension : L 3200mm x W 2300mm x H 2660mm",
        "Weight : 5,200kg",
        "Power Supply : 380~460V / 60hz",
      ],
    },
    {
      img: "/hof/hof-1000.png",
      title: "HOF-1000 Pump",
      specs: [
        "Follow rate for single pump : 515 litres/min",
        "Follow rate for double pump : 1030 litres/min",
        "Dimension : L 3000mm x W 1800mm x H 2450mm",
        "Weight : 3,500kg",
        "Power Supply : 380~460V / 60hz",
      ],
    },
    {
      img: "/hof/hof-500.png",
      title: "HOF-500",
      specs: [
        "Follow rate for single pump : 500 litres/min",
        "Dimension : L 2130mm x W 1470mm x H 2190mm",
        "Weight : 2,000kg ~ 2,400kg",
        "Power Supply : 380~460VAC, 50/60hz",
      ],
    },
    {
      img: "/hof/hof-500-explosion.png",
      title: "HOF-500 Explosion Proof (Zone-Rated)",
      specs: [
        "Follow rate for single pump : 515 litres/min",
        "Dimension : L 2130mm x W 1470mm x H 2190mm",
        "Weight : 2,400kg",
        "Power Supply : 380~460VAC, 50/60hz",
      ],
    },
    {
      img: "/hof/wgp.png",
      title: "Water-Glycol Pump (WGP)",
      specs: [
        "Follow rate for single pump : 160 litres/min",
        "Dimension : L 2150mm x W 1500mm x H 2300mm",
        "Weight : 3,000kg",
        "Power Supply : 380~420 VAC, 50hz",
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
            <span className="text-green-500">Hot Oil</span> Flushing
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-5xl mx-auto py-8 px-4 text-center text-gray-700">
        <p>
          Hot oil flushing is done using flushing or system oil to remove the
          fouling from the internals of the piping systems. Flow is crucial
          during flushing as it determines the cleanliness in the piping
          systems. CESCO's uniquely designed oil flushing pumps are able to
          achieve cleanliness results to our customers' satisfaction. Our pumps
          consist mainly of fine filters, which capture the particles during
          flushing and sampling point to connect online laser particle counter
          to check the cleanliness. CESCO also has a complete range of
          auxiliary equipment associated with hot oil flushing.
        </p>
      </div>

      {/* Pumps */}
      <div className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {pumps.map((pump, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center hover:shadow-xl transition duration-300"
          >
            <div className="w-full h-[200px] relative">
              <Image
                src={pump.img}
                alt={pump.title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-center text-black">
              {pump.title}
            </h3>
            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {pump.specs.map((spec, idx) => (
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
