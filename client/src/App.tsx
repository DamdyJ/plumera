// import Navbar from "./components/app/navbar.test";
import HeroSection from "./pages/app/components/hero-section";
import Features from "./pages/app/components/features";
import FooterSection from "./pages/app/components/footer";
import Hero from "./pages/app/components/hero";
import Navbar from "./pages/app/components/Navbar";
import Pricing from "./pages/app/components/pricing";
import WallOfLoveSection from "./pages/app/components/testimonials";

// import { Navbar } from "./components/ui/navbar";

export default function App() {
  return (
    <>
      <HeroSection />
      <Features />
      <WallOfLoveSection />
      <Pricing />
      <FooterSection />
      {/* <main className="relative">
        <Navbar />
        <Hero />
      </main> */}
    </>
  );
}
