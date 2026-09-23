import React from "react";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import { FloatingLeaves } from "@/components/atoms";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { EnvironmentsSection } from "@/components/landing/EnvironmentsSection";
import { VibeEconomySection } from "@/components/landing/VibeEconomySection";
import { SentinelSection } from "@/components/landing/SentinelSection";

import { ProfessionalsSection } from "@/components/landing/ProfessionalsSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Footer } from "@/components/landing/Footer";

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Se já autenticado, vai direto para o Santuário
  if (user) {
    redirect("/santuario");
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-navy selection:bg-mint/30 relative overflow-x-hidden">
      <FloatingLeaves count={12} />
      <Navbar />

      <main>
        <Hero />
        <InteractiveDemo />
        <EnvironmentsSection />
        <VibeEconomySection />
        <SentinelSection />

        <ProfessionalsSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
