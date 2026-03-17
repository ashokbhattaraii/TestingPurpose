import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import axiosInstance from "@/lib/axios/axios";
import {
  CreateRequestPayload,
  RequestResponse,
} from "@/lib/type/requestType";
import { toast } from "sonner";

export default function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["newRequest"],
    mutationFn: async (dto: CreateRequestPayload) => {
      const response = await axiosInstance.post("/request/create", dto);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success("Request Created: Your service request has been created successfully.");
      // Invalidate both keys to ensure all components are updated
      queryClient.invalidateQueries({ queryKey: ["allRequests"] });
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.response?.data?.message || "An error occurred while creating the request."}`);
    },
  });
}

export function useGetAllRequestsQuery() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return useQuery<RequestResponse[]>({
    queryKey: ["allRequests"],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        message: string;
        requests: RequestResponse[];
      }>("/request/requests");
      return response.data?.requests || [];
    },
    enabled: isClient,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
    retry: true,
  });
}
