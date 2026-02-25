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

type RequestResponse = {
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
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
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
