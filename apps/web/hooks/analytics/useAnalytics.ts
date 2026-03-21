import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { AnalyticsData } from "@/lib/types";

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await axiosInstance.get<AnalyticsData>("/analytics");
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    retry: true,
  });
}
