import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import {
  CreateRequestPayload,
  GetRequestsResponse,
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
      queryClient.invalidateQueries({ queryKey: ["requests"] });
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
      const response = await axiosInstance.get("/request/requests");

      return response.data as GetRequestsResponse[];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 100,
    retry: true,
  });
}
