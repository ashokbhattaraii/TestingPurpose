import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      priority,
    }: {
      title: string;
      content: string;
      priority: string;
    }) => {
      const response = await axiosInstance.post("/announcements", {
        title,
        content,
        priority,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
