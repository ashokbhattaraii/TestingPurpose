"use client";

import { LucideIcon } from "lucide-react";

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesProps {
  features?: FeatureCard[];
  title?: string;
  subtitle?: string;
}

export function FeaturesSection({
  features = [],
  title = "Powerful Features for Modern Workplaces",
  subtitle = "Everything you need to manage your office efficiently with real-time updates, team collaboration, and comprehensive analytics",
}: FeaturesProps) {
  return (
    <section
      id="features"
      className="border-t border-primary/10 bg-gradient-to-b from-background via-primary/5 to-background py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: FeatureCard;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const { icon: Icon, title, description } = feature;

  return (
    <div className="group rounded-xl border border-primary/15 bg-card p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 mb-5 transition-all">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}