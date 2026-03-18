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
    id: string;
    name: string;
    email: string;
    roles: string[];
    department: string;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    photoURL?: string;
  };
};

export type GetRequestsResponse = RequestResponse[];

export interface GetRequestByIdResponse {
  message: string;
  request: RequestResponse; // reuse your existing type
}

