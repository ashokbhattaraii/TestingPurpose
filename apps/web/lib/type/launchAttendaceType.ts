import { MealPreference } from "../types";
type LauncAttendanceType = {
  isAttending: boolean;
  preferredLunchOption: MealPreference;
};

type LaunchAttendanceSummary = {
  total: number;
  attending: number;
  attendances: {
    id: string;
    userId: string;
    isAttending: LauncAttendanceType;
  };
};

export type { LauncAttendanceType, LaunchAttendanceSummary };
