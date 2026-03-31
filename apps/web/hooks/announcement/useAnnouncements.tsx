import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { Announcement } from "@/lib/types";

export function useAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await axiosInstance.get<Announcement[]>("/announcements");
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: true,
  });
}
