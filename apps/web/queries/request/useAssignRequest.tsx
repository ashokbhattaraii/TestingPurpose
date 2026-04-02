import axiosInstance from "@/lib/axios/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
        //
        onSuccess: (data, variables) => {
            toast.success(`Request assigned to ${variables.assignedToName}. They have been notified.`);
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["request", variables.requestId] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to assign request.");
        }
    });
}
