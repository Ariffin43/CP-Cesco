import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Clients from "./components/Clients";
import About from "./components/About";
import Service from "./components/Service";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import OurFacilitiesSection from "./components/Facilities";

export default function Home() {
  return (
    <div className="overflow-y-hidden">
      <Navbar />
      <Hero />
      <Clients />
      <About />
      <Service />
      <OurFacilitiesSection />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}
