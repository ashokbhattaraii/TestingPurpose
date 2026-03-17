import axiosInstance from "@/lib/axios/axios";
import { ServiceRequest } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useServiceRequests(userId?: string) {
    return useQuery<ServiceRequest[]>({
        queryKey: ["serviceRequests", userId],
        queryFn: async () => {
            const response = await axiosInstance.get<ServiceRequest[]>("/request/requests", {
                params: userId ? { userId } : {},
            });
            return response.data;
        },
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 5 * 1000,
        retry: true,
    });
}
