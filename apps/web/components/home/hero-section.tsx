"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeroStatItem {
  title: string;
  desc: string;
}

interface HeroProps {
  stats?: HeroStatItem[];
}

export function HeroSection({
  stats = [
    { title: "Service Requests", desc: "2,543 processed" },
    { title: "Team Members", desc: "1,240 active" },
    { title: "Office Facilities", desc: "95% optimal" },
  ],
}: HeroProps) {
  const router = useRouter();

  return (
    <section className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
              ✨ Unified Workspace Management
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-tight">
              Streamline Your Office Operations
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-balance">
              WorkOps is the all-in-one platform for managing office utilities,
              service requests, and facility coordination. Keep your workplace
              running smoothly with centralized control and real-time insights.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary/5 bg-transparent"
            >
              Learn More
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-primary/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground font-medium">
                Trusted by 500+ companies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground font-medium">
                Enterprise security
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual - Stats Cards */}
        <div className="relative hidden lg:block">
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card p-10 shadow-2xl">
            <div className="space-y-5">
              {stats.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-primary/10 bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}