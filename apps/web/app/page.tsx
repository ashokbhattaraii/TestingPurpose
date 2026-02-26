"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  BarChart3,
  Users,
  Clock,
  Zap,
  Shield,
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
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("");

  console.log(
    "👤From app page  Current user:",
    user?.email,
    "Role:",
    user?.role,
  );

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const features: FeatureCard[] = [
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Get instant notifications about service requests and facility issues",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Keep your entire team synchronized with shared announcements",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track metrics and gain insights into office utilization",
    },
    {
      icon: Zap,
      title: "Quick Service Requests",
      description: "Submit and track maintenance requests in seconds",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Secure permissions for employees, admins, and super admins",
    },
    {
      icon: Building2,
      title: "Facility Management",
      description: "Centralize all office operations in one platform",
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