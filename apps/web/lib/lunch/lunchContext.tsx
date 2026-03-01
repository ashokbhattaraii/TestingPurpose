"use client";
import { useContext, createContext, useMemo, useEffect } from "react";
import { useLaunchAttendanceSummary } from "@/hooks/launch/useLaunchAttendance";

export interface LunchContextType {
  totalAttending: number;
  totalTokens: number;
  totalVegetarian: number;
  totalNonVegetarian: number;
  attendanceSummary: any;
}

const lunchContext = createContext<LunchContextType | undefined>(undefined);

import { useAuth } from "@/lib/auth-context";

export const LunchProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { data: attendanceSummary } = useLaunchAttendanceSummary(!!user);

  // Debug: log raw API data to verify structure
  useEffect(() => {
    console.log(
      "attendanceSummary raw data:",
      JSON.stringify(attendanceSummary, null, 2),
    );
  }, [attendanceSummary]);

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
