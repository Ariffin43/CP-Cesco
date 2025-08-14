import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Clients from "./components/Clients";
import About from "./components/About";
import Service from "./components/Service";
// import Gallery from "./components/Gallery";
// import Contact from "./components/Contact";
// import Footer from "./components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Clients />
      <About />
      <Service />
      {/* <Gallery />
      <Contact />
      <Footer /> */}
    </div>
  );
}
