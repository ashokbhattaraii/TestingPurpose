import axiosInstance from "@/lib/axios/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useReopenRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string; userId: string; userName: string }) => {
            const response = await axiosInstance.post(`/request/${id}/reopen`);
            return response.data;
        },
        onSuccess: (_, variables) => {
            toast.success("Request has been reopened. Admins have been notified.");
            queryClient.invalidateQueries({ queryKey: ["request", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to reopen request.");
        }
    });
}
