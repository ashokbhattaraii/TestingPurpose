"use client";

import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
  section: string;
}

interface NavigationProps {
  navLinks?: NavLink[];
  onNavClick?: (section: string) => void;
  activeSection?: string;
}

export function Navigation({
  navLinks = [
    { label: "Features", href: "#features", section: "features" },
    { label: "Benefits", href: "#benefits", section: "benefits" },
  ],
  onNavClick = () => {},
  activeSection = "",
}: NavigationProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white transition-transform group-hover:scale-105 shadow-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent hidden sm:inline">
            WorkOps
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.section}
              href={link.href}
              onClick={() => onNavClick(link.section)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                activeSection === link.section
                  ? "bg-primary text-white shadow-md"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Login Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/login")}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Log in
          </Button>
        </div>
      </div>
    </nav>
  );
}