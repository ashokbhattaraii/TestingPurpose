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
    });
}
