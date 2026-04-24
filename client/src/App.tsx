import HeroSection from "./pages/app/components/HeroSection";
import Features from "./pages/app/components/Features";
import FooterSection from "./pages/app/components/Footer";
import Pricing from "./pages/app/components/Pricing";
import WallOfLoveSection from "./pages/app/components/Testimonials";

export default function App() {
  return (
    <>
      <HeroSection />
      <Features />
      <WallOfLoveSection />
      <Pricing />
      <FooterSection />
    </>
  );
}
