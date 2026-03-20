"use client";

import { useState } from "react";
import {
  ClipboardList,
  UtensilsCrossed,
  Megaphone,
  BarChart3,
} from "lucide-react";
import {
  Navigation,
  HeroSection,
  FeaturesSection,
  BenefitsSection,
  CTASection,
  Footer,
  BackgroundGradient,
  FeatureCard,
} from "@/components/home";

export default function HomePage() {

  const [activeSection, setActiveSection] = useState<string>("");
  const features: FeatureCard[] = [
    {
      icon: ClipboardList,
      title: "Service Requests",
      description:
        "Easily submit requests for office supplies or report facility/IT issues.",
    },
    {
      icon: UtensilsCrossed,
      title: "Lunch Management",
      description:
        "Input your daily lunch attendance and manage meal preferences smoothly.",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      description:
        "Stay updated with important office news and team broadcasts.",
    },
    {
      icon: BarChart3,
      title: "Admin Analytics",
      description:
        "Comprehensive dashboards for admins to review, track, and resolve requests.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundGradient />

      <Navigation activeSection={activeSection} onNavClick={setActiveSection} />

      <HeroSection />

      <FeaturesSection features={features} />

      <BenefitsSection />

      <CTASection />

      <Footer />
    </div>
  );
}