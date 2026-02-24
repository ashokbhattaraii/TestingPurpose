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
