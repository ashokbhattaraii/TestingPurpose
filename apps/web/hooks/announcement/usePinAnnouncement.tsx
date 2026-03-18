import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";

export function usePinAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      announcementId,
      pinned,
    }: {
      announcementId: string;
      pinned: boolean;
    }) => {
      const response = await axiosInstance.patch(`/announcements/${announcementId}/pin`, {
        pinned,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
