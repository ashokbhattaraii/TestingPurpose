import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import { CreateRequestPayload } from "@/lib/type/requestType";
import { toast } from "@/hooks/use-toast";
export default function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["newRequest"],
    mutationFn: async (dto: CreateRequestPayload) => {
      const response = await axiosInstance.post("/request/create", dto);
      return response.data;
    },
    onSuccess: (data) => {
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

export function useGetMyRequestsQuery() {
  return useQuery({
    queryKey: ["myRequests"],
    queryFn: async () => {
      const response = await axiosInstance.get("/request/my-requests");
      return response.data;
    },
    retry: true,
  });
}
