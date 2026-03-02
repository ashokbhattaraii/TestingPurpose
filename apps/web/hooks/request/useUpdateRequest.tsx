import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { toast } from "@/hooks/use-toast";

interface UpdateRequestPayload {
    id: string;
    type?: "ISSUE" | "Supplies";
    title?: string;
    description?: string;
    attachments?: string[];
    issueDetails?: {
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
        category: "TECHNICAL" | "FACILITY" | "HR" | "ADMINISTRATIVE" | "SECURITY" | "OTHER";
        location?: string;
    };
    suppliesDetails?: {
        category: "OFFICE_SUPPLIES" | "EQUIPMENT" | "STATIONERY" | "PANTRY" | "CLEANING" | "TECHNOLOGY" | "OTHER";
        itemName: string;
    };
}

export function useUpdateRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }: {
            id: string;
            type: "ISSUE" | "Supplies";
            title: string;
            description?: string;
            issuePriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            issueCategory?: "TECHNICAL" | "FACILITY" | "HR" | "ADMINISTRATIVE" | "SECURITY" | "OTHER";
            location?: string;
            SuppliesCategory?: "OFFICE_SUPPLIES" | "EQUIPMENT" | "STATIONERY" | "PANTRY" | "CLEANING" | "TECHNOLOGY" | "OTHER" | "OFFICE_Supplies";
            itemName?: string;
        }) => {
            // transform the payload mapping to backend DTO structure
            const payload: UpdateRequestPayload = {
                id,
                type: data.type,
                title: data.title,
                description: data.description,
            };

            if (data.type === "ISSUE") {
                payload.issueDetails = {
                    priority: data.issuePriority as any,
                    category: data.issueCategory as any,
                    location: data.location,
                };
            } else if (data.type === "Supplies") {
                payload.suppliesDetails = {
                    category: (data.SuppliesCategory === "OFFICE_Supplies" ? "OFFICE_SUPPLIES" : data.SuppliesCategory) as any,
                    itemName: data.itemName || "",
                };
            }

            const response = await axiosInstance.patch(`/request/${id}`, payload);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["request", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["allRequests"] });
            queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
        onError: (error: any) => {
            console.error(error);
        }
    });
}
