import Navbar from "@/components/layout/navbar";
import Footer from "@/components/marketing/footer";
import Hero from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import Pricing from "@/components/marketing/pricing";
import CTA from "@/components/marketing/cta";
import HowItWorks from "@/components/marketing/howitworks";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}