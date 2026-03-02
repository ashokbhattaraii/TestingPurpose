import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { toast } from "@/hooks/use-toast";
import { IssueCategory, IssuePriority, SuppliesCategory, RequestType } from "@/lib/types";

interface UpdateRequestPayload {
    id: string;
    type?: RequestType;
    title?: string;
    description?: string;
    attachments?: string[];
    issueDetails?: {
        priority: IssuePriority;
        category: IssueCategory;
        location?: string;
    };
    suppliesDetails?: {
        category: SuppliesCategory;
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
            type: RequestType;
            title: string;
            description?: string;
            issuePriority?: IssuePriority;
            issueCategory?: IssueCategory;
            location?: string;
            suppliesCategory?: SuppliesCategory;
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
            } else if (data.type === "SUPPLIES") {
                payload.suppliesDetails = {
                    category: data.suppliesCategory as any,
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
