import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import "./globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "WorkOps - Office Utility Management",
  description:
    "Centralized digital platform for office utility management, service requests, and facility coordination.",
  icons: {
    icon: "/rumsan-logo-blk.png",
  },
};
//test
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
