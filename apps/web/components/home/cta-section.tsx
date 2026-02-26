"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CTASectionProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
}

export function CTASection({
  heading = "Ready to Transform Your Office?",
  subheading = "Join hundreds of companies that trust WorkOps for their facility management needs.",
  ctaText = "Get Started Now",
}: CTASectionProps) {
  const router = useRouter();

  return (
    <section className="border-t border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {heading}
        </h2>
        <p className="text-lg text-muted-foreground mb-10">{subheading}</p>
        <Button
          size="lg"
          onClick={() => router.push("/login")}
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
        >
          {ctaText}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}