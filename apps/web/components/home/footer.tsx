"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  footerLinks?: FooterLink[];
  copyright?: string;
}

export function Footer({
  footerLinks = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ],
  copyright = "© 2026 WorkOps. All rights reserved.",
}: FooterProps) {
  return (
    <footer className="border-t border-primary/10 bg-gradient-to-b from-background to-muted/30 py-12 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">{copyright}</p>
          </div>
          <div className="flex gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}