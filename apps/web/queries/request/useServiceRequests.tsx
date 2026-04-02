import axiosInstance from "@/lib/axios/axios";
import { RequestResponse } from "@/lib/type/requestType";
import { useQuery } from "@tanstack/react-query";

export function useServiceRequests(userId?: string) {
    return useQuery<RequestResponse[]>({
        queryKey: ["serviceRequests", userId],
        queryFn: async () => {
            const response = await axiosInstance.get<{
                message: string;
                requests: RequestResponse[];
            }>("/request/requests", {
                params: userId ? { userId } : {},
            });
            // If the API returns a nested requests array, return that. otherwise return the data itself if it's an array.
            const data = response.data as any;
            return data?.requests || (Array.isArray(data) ? data : []);
        },
        staleTime: 0,
        gcTime: 5 * 60 * 1000,

        retry: true,
    });
}
