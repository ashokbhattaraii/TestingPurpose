"use client";

import { useAuth } from "@/lib/auth-context";
import { EmployeeDashboard } from "@/components/dashboard-employee";
import { AdminDashboard } from "@/components/dashboard-admin";
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
    console.log(" No user found, should redirect to login");
    return null;
  }

  console.log(" Rendering dashboard for role:", user?.roles.includes('EMPLOYEE'));

  const isAdmin = user?.roles?.some((r) => r.includes("ADMIN"));
  if (isAdmin) {
    return <AdminDashboard />;
  }
  if (!isAdmin) {
    return <EmployeeDashboard />;
  }

}
