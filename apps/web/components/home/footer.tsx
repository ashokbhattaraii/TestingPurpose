"use client";

import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  footerLinks?: FooterLink[];
  copyright?: string;
}
//check
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
              <img src="/rumsan-logo-blk.png" alt="Rumsan Logo" className="h-full w-full object-contain dark:invert" />
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