import axiosInstance from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";

import { GetRequestByIdResponse } from "@/lib/type/requestType";

export function useGetRequestByIdQuery(requestId: string) {
  return useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/request/${requestId}`);
      return response.data as GetRequestByIdResponse;
    },
    enabled: !!requestId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000,
    retry: true,
  });
}
