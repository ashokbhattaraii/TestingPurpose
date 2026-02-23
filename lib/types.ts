export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type RequestType = "ISSUE" | "Supplies";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type IssueCategory =
  | "TECHNICAL"
  | "FACILITY"
  | "HR"
  | "ADMINISTRATIVE"
  | "SECURITY"
  | "OTHER";

export type SuppliesCategory =
  | "OFFICE_Supplies"
  | "EQUIPMENT"
  | "STATIONERY"
  | "PANTRY"
  | "CLEANING"
  | "TECHNOLOGY"
  | "OTHER";

export type SocialProvider = "google" | "github" | "linkedin";
export interface SocialAccount {
  provider: SocialProvider;
  email: string;
  connectedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  joinedAt: string;
  status: "active" | "inactive";
  lastLogin?: string;
  socialAccounts?: SocialAccount[];
  notificationPreferences?: {
    emailNotifications: boolean;
    announcements: boolean;
    assignments: boolean;
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ServiceRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  title: string;
  description: string;

  // Issue-specific fields
  issuePriority?: IssuePriority;
  issueCategory?: IssueCategory;
  location?: string;

  // Supplies-specific fields
  SuppliesCategory?: SuppliesCategory;
  itemName: string;

  // Common fields
  attachments?: Attachment[];

  // Approval
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;

  // Fulfillment (for Supplies)
  isFulfilled?: boolean;
  fulfilledAt?: string;
  fulfilledBy?: string;

  // Timestamps & Relations
  userId: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
  pinned: boolean;
}

export type MealPreference = "veg" | "non-veg";

export interface LunchToken {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  preference: MealPreference;
  collectedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AnalyticsData {
  totalRequests: number;
  pendingRequests: number;
  onHoldRequests: number;
  inProgressRequests: number;

  resolvedRequests: number;
  avgResolutionTimeHours: number;
  requestsByCategory: { category: string; count: number }[];
  requestsByMonth: { month: string; count: number }[];
  requestsByStatus: { status: string; count: number }[];
}
