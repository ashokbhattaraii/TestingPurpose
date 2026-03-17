import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: {
      title: string;
      content: string;
      authorId: string;
      authorName: string;
    }) => {
      const response = await axiosInstance.post("/announcements", {
        title,
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
