import axiosInstance from "@/lib/axios/axios";
import { RequestStatus } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateRequestStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            status,
            rejectionReason,
        }: {
            id: string;
            status: RequestStatus;
            rejectionReason?: string;
        }) => {
            const response = await axiosInstance.post(`/request/${id}/status`, {
                status,
                rejectionReason,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["request", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
    });
}
