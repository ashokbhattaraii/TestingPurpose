import axiosInstance from "@/lib/axios/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAssignRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            requestId,
            assignedToId,
        }: {
            requestId: string;
            assignedToId: string;
            assignedToName: string;
            assignedByName: string;
        }) => {
            const response = await axiosInstance.post(`/request/${requestId}/assign`, {
                assignedToId,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["request", variables.requestId] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
    });
}
