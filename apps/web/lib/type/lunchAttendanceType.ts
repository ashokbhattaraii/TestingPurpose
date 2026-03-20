import { MealPreference } from "../types";

type LunchAttendanceType = {
  isAttending: boolean;
  preferredLunchOption: MealPreference;
  userId?: string;
};

// Matches the actual API response from GET /lunch/attendance-summary
type LunchAttendanceSummary = {
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

export type { LunchAttendanceType, LunchAttendanceSummary };

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
