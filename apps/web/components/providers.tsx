"use client"

import type { ReactNode } from "react"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { LunchProvider } from "@/lib/lunch/lunchContext"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          <LunchProvider>
            {children}
            <Toaster />
          </LunchProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
