import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { ModelSection } from "@/components/site/ModelSection";
import { AIScout } from "@/components/site/AIScout";
import { Simulator } from "@/components/site/Simulator";
import { Footer } from "@/components/site/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "CropSim — Simulate the harvest before a seed is sown";
    const desc = "AI-powered crop yield, cost, profit, and weather risk simulator for India, US Midwest, and African smallholder regions.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
  return (
    <main>
      <Nav />
      <Hero />
      <ModelSection />
      <AIScout />
      <Simulator />
      <Footer />
    </main>
  );
};

export default Index;
