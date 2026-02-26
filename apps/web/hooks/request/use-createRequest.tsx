import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import axiosInstance from "@/lib/axios/axios";
import {
  CreateRequestPayload,
  RequestResponse,
} from "@/lib/type/requestType";
import { toast } from "@/hooks/use-toast";

export default function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["newRequest"],
    mutationFn: async (dto: CreateRequestPayload) => {
      const response = await axiosInstance.post("/request/create", dto);
      return response.data;
    },
    onSuccess: (res) => {
      toast({
        title: "Request Created",
        description: "Your service request has been created successfully.",
      });
      // Invalidate "allRequests" to match the query key used in useGetAllRequestsQuery
      queryClient.invalidateQueries({ queryKey: ["allRequests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "An error occurred while creating the request.",
        variant: "destructive",
      });
    },
  });
}

export function useGetAllRequestsQuery() {
  return useQuery({
    queryKey: ["allRequests"],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        message: string;
        requests: RequestResponse[];
      }>("/request/requests");
      return response.data?.requests || [];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    retry: true,
  });
}
