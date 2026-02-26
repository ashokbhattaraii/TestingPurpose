import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { LunchProvider } from "@/lib/lunch/lunchContext";
import { QueryProvider } from "@/lib/query-provider";
const _inter = Inter({ subsets: ["latin"] });
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "WorkOps - Office Utility Management",
  description:
    "Centralized digital platform for office utility management, service requests, and facility coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <LunchProvider>
            <QueryProvider>
              {children}
              <Toaster />{" "}
            </QueryProvider>
            {/* Moved Toaster inside Providers to ensure it has access to the context */}
          </LunchProvider>
        </Providers>
      </body>
    </html>
  );
}
