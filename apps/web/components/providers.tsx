"use client"

import type { ReactNode } from "react"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { LunchProvider } from "@/lib/lunch/lunchContext"
import { GoogleOAuthProvider } from "@react-oauth/google"

export function Providers({ children }: { children: ReactNode }) {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""; // Fallback to provided one
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryProvider>
          <AuthProvider>
            <LunchProvider>
              {children}
              <Toaster />
            </LunchProvider>
          </AuthProvider>
        </QueryProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  )
}
