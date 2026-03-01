import axiosInstance from "@/lib/axios/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useReopenRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string; userId: string; userName: string }) => {
            const response = await axiosInstance.post(`/request/${id}/reopen`);
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
