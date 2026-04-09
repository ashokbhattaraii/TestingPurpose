export type UserRole = "ADMIN" | "EMPLOYEE";

export type RequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "ON_HOLD"
  | "CANCELLED";
//addded

export type RequestType = "ISSUE" | "SUPPLIES";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type IssueCategory =
  | "TECHNICAL"
  | "FACILITY"
  | "HR"
  | "ADMINISTRATIVE"
  | "SECURITY"
  | "OTHER";

export type SuppliesCategory =
  | "OFFICE_SUPPLIES"
  | "EQUIPMENT"
  | "STATIONERY"
  | "PANTRY"
  | "CLEANING"
  | "TECHNOLOGY"
  | "OTHER";

export type SocialProvider = "google" | "slack";
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
  roles: string[];
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

export interface ServiceRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  title: string;
  description: string;

  // Issue-specific fields
  issuePriority?: IssuePriority;
  issueCategory?: IssueCategory;
  otherCategoryDetails?: string;
  location?: string;

  // Supplies-specific fields
  SuppliesCategory?: SuppliesCategory;
  itemName: string;

  // Approval
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;

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
  createdById: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
  pinned: boolean;
  priority: string;
}

export type MealPreference = "VEG" | "NON_VEG" | "VEGAN";
//types
export interface LunchToken {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  preferredLunchOption: MealPreference;
  collectedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}
//analytics

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
