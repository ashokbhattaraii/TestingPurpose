"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { QueryProvider } from "@/lib/query-provider";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log("🔒 Dashboard Layout - Loading:", isLoading);
  console.log("🔒 Dashboard Layout - User:", user);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("🔒 No user, redirecting to login");
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <QueryProvider>
      <DashboardShell>{children}</DashboardShell>
    </QueryProvider>
  );
}
