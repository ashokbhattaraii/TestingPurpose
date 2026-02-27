enum RequestType {
  ISSUE = "ISSUE",
  SUPPLIES = "SUPPLIES",
}
type ApiRequestPayload = {
  type: "ISSUE" | "SUPPLIES";
  title: string;
  description?: string;
  attachments: string[];
  issueDetails?: {
    priority: "LOW" | "MEDIUM" | "HIGH";
    category: "HARDWARE" | "SOFTWARE" | "NETWORK";
    location?: string;
  };
  suppliesDetails?: {
    category: "OFFICE" | "MAINTENANCE" | "OTHER";
    itemName: string;
  };
};

export type CreateRequestPayload = ApiRequestPayload;

export type RequestResponse = {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  attachments: string[];
  issueDetails?: {
    priority: "LOW" | "MEDIUM" | "HIGH";
    category: "HARDWARE" | "SOFTWARE" | "NETWORK";
    location?: string;
  };
  suppliesDetails?: {
    category: "OFFICE" | "MAINTENANCE" | "OTHER";
    itemName: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "ON_HOLD" | "COMPLETED";
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
