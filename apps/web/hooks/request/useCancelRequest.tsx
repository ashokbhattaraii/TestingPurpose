import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { useToast } from "../use-toast";

export const useCancelRequest = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["cancel-request"],
        mutationFn: async (id: string) => {
            const res = await axiosInstance.patch(`/request/${id}/cancel`)
            return res.data
        },
        onSuccess: (data, id) => {

            queryClient.invalidateQueries({ queryKey: ["requests", id] })
            queryClient.invalidateQueries({ queryKey: ["request", id] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast({
                title: "Failed to cancel request",
                variant: "destructive"
            })
        }
    })

}