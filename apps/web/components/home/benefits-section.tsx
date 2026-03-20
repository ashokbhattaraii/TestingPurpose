"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BenefitItem {
  title: string;
  desc: string;
}

interface BenefitsSectionProps {
  sidebarBenefits?: BenefitItem[];
  mainBenefits?: string[];
  heading?: string;
  subheading?: string;
  ctaText?: string;
}

export function BenefitsSection({
  sidebarBenefits = [
    {
      title: "All-in-One Portal",
      desc: "Requests, lunch, and news in one single dashboard.",
    },
    {
      title: "Instant Status Updates",
      desc: "Track your requests from pending to resolved real-time.",
    },
    {
      title: "Role-Based Features",
      desc: "Tools tailored for both employees and admin staff.",
    },
  ],
  mainBenefits = [
    "Single sign-on for all office service requests",
    "Digital lunch tokens and preference management",
    "Real-time announcements and important broadcasts",
    "Simple tracking of IT and facility issues",
    "Detailed analytics for admins to optimize resources",
    "Clean, modern interface shared by the whole team",
  ],
  heading = "Built for Our Workspace",
  subheading = "WorkOps is designed to remove friction from our everyday office tasks, giving everyone more time to focus on what matters.",
  ctaText = "Get Started",
}: BenefitsSectionProps) {
  const router = useRouter();

  return (
    <section id="benefits" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Right Sidebar - Benefits Visual */}
          <div className="relative hidden lg:block order-2">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card p-12 shadow-2xl">
              <div className="space-y-6">
                {sidebarBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        {benefit.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Content */}
          <div className="flex flex-col gap-8 order-1">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {heading}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {subheading}
              </p>
            </div>

            <div className="space-y-4">
              {mainBenefits.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground font-medium">{point}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all gap-2"
            >
              {ctaText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}