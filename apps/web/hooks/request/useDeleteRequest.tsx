import axiosInstance from "@/lib/axios/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {

            const response = await axiosInstance.delete(`/request/${requestId}`);
            return response.data;
        },
        onSuccess: (_, requestId) => {
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.removeQueries({ queryKey: ["request", requestId] });
        },
        onError: (error) => {
            console.error("Error deleting request:", error);
        },
    });
}
