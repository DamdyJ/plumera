import HeroSection from "./pages/app/components/hero-section";
import Features from "./pages/app/components/features";
import FooterSection from "./pages/app/components/footer";
import Pricing from "./pages/app/components/pricing";
import WallOfLoveSection from "./pages/app/components/testimonials";

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
