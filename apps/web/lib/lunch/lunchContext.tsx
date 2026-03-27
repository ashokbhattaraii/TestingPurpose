"use client";
import { useContext, createContext, useMemo, useEffect } from "react";
import { useLunchAttendanceSummary } from "@/hooks/lunch/useLunchAttendance";

export interface LunchContextType {
  totalAttending: number;
  totalTokens: number;
  totalVegetarian: number;
  totalNonVegetarian: number;
  attendanceSummary: any;
}

const lunchContext = createContext<LunchContextType | undefined>(undefined);

import { useAuth } from "@/lib/auth-context";

import { usePathname } from "next/navigation";

export const LunchProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  // Only fetch attendance-summary on pages that actually use it
  const lunchRoutes = ["/dashboard", "/lunch"];
  const needsLunchData = lunchRoutes.includes(pathname);

  // Only run the query if a user is logged in AND we are on a lunch-relevant route
  const { data: attendanceSummary } = useLunchAttendanceSummary(
    !!user && needsLunchData
  );



  const contextValue: LunchContextType = useMemo(() => {
    if (!attendanceSummary) {
      return {
        totalAttending: 0,
        totalTokens: 0,
        totalVegetarian: 0,
        totalNonVegetarian: 0,
        attendanceSummary: null,
      };
    }

    const attendances = Array.isArray(attendanceSummary?.attendances)
      ? attendanceSummary.attendances
      : [];

    const activeAttendances = attendances.filter(
      (attendance: any) => attendance.isAttending,
    );

    const vegCount = activeAttendances.filter(
      (attendance: any) =>
        attendance.preferredLunchOption === "VEG",
    ).length;

    const nonVegCount = activeAttendances.filter(
      (attendance: any) =>
        attendance.preferredLunchOption === "NON_VEG",
    ).length;

    const tokenCount = activeAttendances.length;

    return {
      totalAttending: activeAttendances.length,
      totalTokens: tokenCount,
      totalVegetarian: vegCount,
      totalNonVegetarian: nonVegCount,
      attendanceSummary,
    };
  }, [attendanceSummary]);

  return (
    <lunchContext.Provider value={contextValue}>
      {children}
    </lunchContext.Provider>
  );
};

export const useLunchContext = () => {
  const context = useContext(lunchContext);
  if (context === undefined) {
    throw new Error("useLunchContext must be used within a LunchProvider");
  }
  return context;
};
