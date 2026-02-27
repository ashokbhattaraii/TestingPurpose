"use client";

import { useAuth } from "@/lib/auth-context";
import { EmployeeDashboard } from "@/components/dashboard-employee";
import { AdminDashboard } from "@/components/dashboard-admin";
import { SuperadminDashboard } from "@/components/dashboard-superadmin";
import { useLaunchAttendanceSummary } from "@/hooks/launch/useLaunchAttendance";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { data: launchSummary } = useLaunchAttendanceSummary();

  console.log("Launch Attendance Summary:", launchSummary);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log("❌ No user found, should redirect to login");
    return null;
  }

  console.log("✅ Rendering dashboard for role:", user.role);

  if (user?.role === "EMPLOYEE") {
    return <EmployeeDashboard />;
  }
  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }
  if (user?.role === "SUPER_ADMIN") {
    return <SuperadminDashboard />;
  }
}
