import { IssueCategory, IssuePriority, SuppliesCategory, RequestType as AppRequestType, RequestStatus } from "@/lib/types";

enum RequestType {
  ISSUE = "ISSUE",
  SUPPLIES = "SUPPLIES",
}
type ApiRequestPayload = {
  type: "ISSUE" | "SUPPLIES";
  title: string;
  description?: string;
  issueDetails?: {
    priority: IssuePriority;
    category: IssueCategory;
    otherCategoryDetails?: string;
    location?: string;
  };
  suppliesDetails?: {
    category: SuppliesCategory;
    otherCategoryDetails?: string;
    itemName: string;
  };
};

export type CreateRequestPayload = ApiRequestPayload;

export type RequestResponse = {
  id: string;
  userId: string;
  type: AppRequestType;
  title: string;
  description: string;
  issueDetails?: {
    priority: IssuePriority;
    category: IssueCategory;
    otherCategoryDetails?: string;
    location?: string;
  };
  suppliesDetails?: {
    category: SuppliesCategory;
    otherCategoryDetails?: string;
    itemName: string;
  };
  status: RequestStatus;
  approverId?: string;
  approver?: {
    name: string;
    photoURL?: string;
    isAdmin: boolean;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    photoURL?: string;
    isAdmin: boolean;
  };
};

export type GetRequestsResponse = RequestResponse[];

export interface GetRequestByIdResponse {
  message: string;
  request: RequestResponse; // reuse your existing type
}

