import prisma from "../../../../../lib/prisma";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import MachineGrid from "../../MachineGrid";

export default async function CategoryPage({ params }) {
  const { serviceId, categoryId } = await params;
  const sid = Number(serviceId);
  const cid = Number(categoryId);
  if (!Number.isFinite(sid) || !Number.isFinite(cid) || sid <= 0 || cid <= 0) {
    return <p className="text-center py-10">Invalid route parameters.</p>;
  }

  const category = await prisma.machine_categories.findUnique({
    where: { id: cid },
    include: {
      services: true,
      machines: {
        select: { id: true, name: true, desc: true, updatedAt: true },
      },
    },
  });

  if (!category || category.service_id !== sid) {
    return <p className="text-center py-10">Category not found under this service.</p>;
  }

  const machines = category.machines.map((m) => {
    const ts = m.updatedAt ? new Date(m.updatedAt).getTime() : Date.now();
    return {
      ...m,
      imageUrl: `/api/machines/${m.id}/image?ts=${ts}`,
    };
  });

  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero-sec-industri.png"
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center justify-center gap-2 text-sm text-white/80">
              <li><Link href={`/services/${category.services.id}`} className="hover:text-white/100">{category.services.name}</Link></li>
              <li className="opacity-60">/</li>
              <li className="font-medium text-white">{category.name}</li>
            </ol>
          </nav>

          <span className="px-4 py-1 bg-green-500/80 rounded-full text-sm tracking-wide">
            {category.services.name}
          </span>
          <h1 className="mt-4 text-5xl font-bold">
            <span className="text-green-400">{category.name}</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-gray-200">
            {category.desc || "No description available."}
          </p>
        </div>
      </div>

      {/* Machines list */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Our Machine Range
        </h2>

        <MachineGrid machines={machines} />
      </section>

      <Footer />
    </div>
  );
}
