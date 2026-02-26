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
    // Accept optional userId so the optimistic update can match the correct attendance record
    mutationFn: async (payload: LauncAttendanceType & { userId?: string }) => {
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
      // Cancel in-flight refetches so they do not overwrite the optimistic update
      await queryClient.cancelQueries({
        queryKey: ["launch-attendance-summary"],
      });
      await queryClient.cancelQueries({
        queryKey: ["lunch-attendance", "my"],
      });

      // Snapshot current values for rollback on error
      const previousSummary = queryClient.getQueryData([
        "launch-attendance-summary",
      ]);
      const previousMyAttendance = queryClient.getQueryData([
        "lunch-attendance",
        "my",
      ]);

      // Optimistically update the summary so counts change immediately in the context
      queryClient.setQueryData(["launch-attendance-summary"], (old: any) => {
        if (!old) return old;

        const attendances: any[] = old.attendances ?? [];
        const currentUserId = payload.userId;

        let updatedAttendances: any[];

        if (currentUserId) {
          // Update or insert the specific user's attendance record
          const alreadyExists = attendances.some(
            (a: any) => a.userId === currentUserId,
          );

          updatedAttendances = alreadyExists
            ? attendances.map((a: any) =>
              a.userId === currentUserId
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
                  userId: currentUserId,
                  isAttending: true,
                  preferredLunchOption: payload.preferredLunchOption,
                },
              ]
              : attendances;
        } else {
          // No userId provided — leave attendances list unchanged, server refetch will correct this
          updatedAttendances = attendances;
        }

        const attending = updatedAttendances.filter(
          (a: any) => a.isAttending,
        ).length;

        return {
          ...old,
          summary: { ...old.summary, attending },
          attendances: updatedAttendances,
        };
      });

      // Optimistically update my attendance — update the nested attendance object to match
      // the actual API response shape: { message: string, attendance: { ... } }
      queryClient.setQueryData(["lunch-attendance", "my"], (old: any) => ({
        ...old,
        attendance: {
          ...(old?.attendance ?? {}),
          isAttending: payload.isAttending,
          preferredLunchOption: payload.preferredLunchOption,
        },
      }));

      // Return snapshots for rollback
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
