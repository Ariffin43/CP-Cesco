import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function BCpage() {
    const desiccants = [
        {
        img: "/bc/wf-CPE.png",
        title: "Desiccant Dryer with Air Cooler",
        specs: [
            "Capacity : 1,200 cfm AT (dewpoint-40 C / -40F) 840 cfm AT (dewpoint-70 C / -100F) 1320 cdm AT (dewpoint-20 C / -4F)",
            "Dimension : L 1800mm x W 1800mm x H 2250mm",
            "Weight : 1,700kg",
            "Power Supply : 415 VAC, 50 / 60 Hz"
        ],
        },
        {
        img: "/wf/wf-CPF.png",
        title: "Vacum Pump",
        specs: [
            "Follow rate : 110 m3/h",
            "Dimension : L 2000mm x W 1300mm x H 1800mm",
            "Weight : 1,200kg",
            "Power Supply : 7kw, 415v, 3 Phase"
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
                <span className="text-green-500">Desiccant</span> Drying
            </h1>
            </div>
        </div>

        {/* Hydro */}
        <div className="max-w-7xl mx-auto px-4 py-10 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {desiccants.map((desiccant, i) => (
            <div
                key={i}
                className="bg-white shadow-md rounded-lg p-5 flex flex-col items-centerhover:shadow-xl transition duration-300"
            >
                <div className="w-full h-[200px] relative">
                <Image
                    src={desiccant.img}
                    alt={desiccant.title}
                    fill
                    className="object-contain"
                />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-black">
                {desiccant.title}
                </h3>
                <ul className="mt-3 text-sm text-gray-600 space-y-1">
                {desiccant.specs.map((spec, idx) => (
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