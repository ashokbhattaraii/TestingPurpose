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
    refetchInterval: (query) => {
      // Stop refetching if the query has errored (e.g. 404)
      if (query.state.status === "error") return false;
      return 10 * 1000;
    },
    retry: false
  });
}
