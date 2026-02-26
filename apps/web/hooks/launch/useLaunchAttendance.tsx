import axiosInstance from "@/lib/axios/axios";
import {
  LauncAttendanceType,
  LaunchAttendanceSummary,
  myAttendanceResponse,
} from "@/lib/type/launchAttendaceType";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useMyLunchAttendance() {
  return useQuery({
    queryKey: ["lunch-attendance", "my"],
    queryFn: async () => {
      const response = await axiosInstance.get("/launch/my-attendance");
      return response.data as myAttendanceResponse;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 5 * 1000, // 5 minutes
    retry: true,
  });
}

export function useMarkLaunchAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["launch-attendance", "my"],
    mutationFn: async (payload: LauncAttendanceType) => {
      const response = await axiosInstance.post("/launch/attendance", {
        isAttending: payload.isAttending,
        preferredLunchOption: payload.preferredLunchOption,
      });
      return response.data as {
        message: string;
        attendance: LaunchAttendanceSummary;
      };
    },

    onMutate: async (payload) => {
      // 1. Cancel in-flight refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: ["launch-attendance-summary"],
      });
      await queryClient.cancelQueries({
        queryKey: ["lunch-attendance", "my"],
      });

      // 2. Snapshot current values for rollback on error
      const previousSummary = queryClient.getQueryData([
        "launch-attendance-summary",
      ]);
      const previousMyAttendance = queryClient.getQueryData([
        "lunch-attendance",
        "my",
      ]);

      // 3. Optimistically update summary count
      queryClient.setQueryData(["launch-attendance-summary"], (old: any) => {
        if (!old) return old;
        const attendances = old.attendances ?? [];
        const alreadyExists = attendances.some(
          (a: any) => a.userId === old.userId,
        );

        const updatedAttendances = alreadyExists
          ? attendances.map((a: any) =>
              a.userId === old.userId
                ? {
                    ...a,
                    isAttending: payload.isAttending,
                    preferredLunchOption: payload.preferredLunchOption,
                  }
                : a,
            )
          : payload.isAttending
            ? [
                ...attendances,
                {
                  isAttending: true,
                  preferredLunchOption: payload.preferredLunchOption,
                },
              ]
            : attendances;

        const attending = updatedAttendances.filter(
          (a: any) => a.isAttending,
        ).length;

        return {
          ...old,
          summary: { ...old.summary, attending },
          attendances: updatedAttendances,
        };
      });

      // 4. Optimistically update my attendance
      queryClient.setQueryData(["lunch-attendance", "my"], (old: any) => ({
        ...old,
        isAttending: payload.isAttending,
        preferredLunchOption: payload.preferredLunchOption,
      }));

      // 5. Return snapshots for rollback
      return { previousSummary, previousMyAttendance };
    },

    onError: (error: any, _, context) => {
      // Rollback to snapshots on error
      queryClient.setQueryData(
        ["launch-attendance-summary"],
        context?.previousSummary,
      );
      queryClient.setQueryData(
        ["lunch-attendance", "my"],
        context?.previousMyAttendance,
      );

      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update attendance",
        variant: "destructive",
      });
    },

    onSuccess: (data) => {
      toast({
        title: "Attendance Updated",
        description: data.message,
      });
    },

    onSettled: () => {
      // Always refetch after mutation to sync with server truth
      queryClient.invalidateQueries({
        queryKey: ["launch-attendance-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lunch-attendance", "my"],
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
