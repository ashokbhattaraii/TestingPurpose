import axiosInstance from "@/lib/axios/axios";
import {
  LauncAttendanceType,
  LaunchAttendanceSummary,
} from "@/lib/type/launchAttendaceType";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { on } from "events";

export function useMarkLaunchAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationKey: ["launch-attendance"],
    mutationFn: async (payload: LauncAttendanceType) => {
      console.log("Marking attendance with payload:", payload);
      const response = await axiosInstance.post("/launch/attendance", {
        isAttending: payload.isAttending,
        preferredLunchOption: payload.preferredLunchOption,
      });

      return response.data as {
        message: string;
        attendance: LaunchAttendanceSummary;
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Attendance Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({
        queryKey: ["launch-attendance-summary"],
      });
    },
  });
}

export function useLaunchAttendanceSummary() {
  return useQuery({
    queryKey: ["launch-attendance-summary"],
    queryFn: async () => {
      const response = await axiosInstance.get("/launch/attendance-summary");
      return response.data as LaunchAttendanceSummary;
    },
  });
}
