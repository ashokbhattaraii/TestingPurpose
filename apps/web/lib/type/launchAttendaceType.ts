import { MealPreference } from "../types";

type LauncAttendanceType = {
  isAttending: boolean;
  preferredLunchOption: MealPreference;
  userId?: string;
};

// Matches the actual API response from GET /launch/attendance-summary
type LaunchAttendanceSummary = {
  date: string;
  summary: {
    total: number;
    attending: number;
  };
  attendances: {
    id: string;
    userId: string;
    isAttending: boolean;
    preferredLunchOption: MealPreference;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
};

export type { LauncAttendanceType, LaunchAttendanceSummary };

type myAttendanceResponse = {
  message: string;
  attendance: {
    id: string;
    userId: string;
    isAttending: boolean;
    preferredLunchOption: MealPreference;
  } | null;
};

export type { myAttendanceResponse };
