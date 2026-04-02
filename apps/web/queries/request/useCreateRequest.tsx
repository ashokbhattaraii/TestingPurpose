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
      // Invalidate the key to ensure all components are updated
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.response?.data?.message || "An error occurred while creating the request."}`);
    },
  });
}
