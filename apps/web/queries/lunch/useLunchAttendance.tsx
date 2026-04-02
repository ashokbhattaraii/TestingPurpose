import axiosInstance from "@/lib/axios/axios";
import {
  LunchAttendanceType,
  LunchAttendanceSummary,
  myAttendanceResponse,
} from "@/lib/type/lunchAttendanceType";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMyLunchAttendance() {
  return useQuery({
    queryKey: ["lunch-attendance", "my"],
    queryFn: async () => {
      const response = await axiosInstance.get("/lunch/my-attendance");
      return response.data as myAttendanceResponse;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: true,
  });
}

export function useMarkLunchAttendance() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationKey: ["lunch-attendance", "my"],
    // Accept optional userId so the optimistic update can match the correct attendance record
    mutationFn: async (payload: LunchAttendanceType & { userId?: string }) => {
      const response = await axiosInstance.post("/lunch/attendance", {
        isAttending: payload.isAttending,
        preferredLunchOption: payload.preferredLunchOption,
      });
      return response.data as {
        message: string;
        attendance: LunchAttendanceSummary;
      };
    },

    onMutate: async (payload) => {
      // Cancel in-flight refetches so they do not overwrite the optimistic update
      await queryClient.cancelQueries({
        queryKey: ["lunch-attendance-summary"],
      });
      await queryClient.cancelQueries({
        queryKey: ["lunch-attendance", "my"],
      });

      // Snapshot current values for rollback on error
      const previousSummary = queryClient.getQueryData([
        "lunch-attendance-summary",
      ]);
      const previousMyAttendance = queryClient.getQueryData([
        "lunch-attendance",
        "my",
      ]);

      // Optimistically update the summary so counts change immediately in the context
      queryClient.setQueryData(["lunch-attendance-summary"], (old: any) => {
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
        ["lunch-attendance-summary"],
        context?.previousSummary,
      );
      queryClient.setQueryData(
        ["lunch-attendance", "my"],
        context?.previousMyAttendance,
      );

      toast.error(`Error: ${error?.response?.data?.message || "Failed to update attendance"}`);
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: () => {
      // Always refetch after mutation to sync with server truth
      queryClient.invalidateQueries({
        queryKey: ["lunch-attendance-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lunch-attendance", "my"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useLunchAttendanceSummary(enabled: boolean = true) {
  return useQuery({
    queryKey: ["lunch-attendance-summary"],
    queryFn: async () => {
      const response = await axiosInstance.get("/lunch/attendance-summary");
      return response.data as LunchAttendanceSummary;
    },
    enabled: enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: true,
  });
}

export function useNotifyLunchReady() {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/lunch/notify-ready");
      return response.data as { message: string; sent: number; failed: number };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(
        `Error: ${error?.response?.data?.message || "Failed to send notifications"}`,
      );
    },
  });
}

