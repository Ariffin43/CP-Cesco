import prisma from "../../../lib/prisma";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import CategoryCard from "./CategoryCard";

export default async function ServiceDetailPage({ params }) {
  const { serviceId } = await params;
  const id = Number(serviceId);
  if (!Number.isFinite(id) || id <= 0) {
    return <p className="text-center py-10">Invalid service id.</p>;
    }

  const service = await prisma.services.findUnique({
    where: { id },
    include: {
      machine_categories: {
        select: { id: true, name: true, desc: true, updatedAt: true },
      },
    },
  });

  if (!service) return <p className="text-center py-10">Service not found.</p>;

  const categories = service.machine_categories.map((c) => {
    const ts = c.updatedAt ? new Date(c.updatedAt).getTime() : Date.now();
    return {
      ...c,
      imageUrl: `/api/machine-categories/${c.id}/image?ts=${ts}`,
    };
  });

  return (
    <div className="bg-white text-gray-800">
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="relative h-[72vh] sm:h-[78vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-sec-industri.png"
            alt={service.name}
            fill
            priority
            className="object-cover transition-transform duration-700 will-change-transform [transform:translateZ(0)] hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center justify-center gap-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white/100">Home</Link></li>
              <li className="opacity-60">/</li>
              <li className="font-medium text-white">{service.name}</li>
            </ol>
          </nav>

          <span className="inline-flex px-3 py-1 bg-green-500/80 rounded-full text-xs tracking-wide">Service</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold">
            <span className="text-green-400">{service.name}</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-200">{service.desc}</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              serviceId={service.id}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
