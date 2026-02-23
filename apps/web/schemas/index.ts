import * as z from "zod";

// Enums matching the Prisma schema
export const REQUEST_TYPES = ["ISSUE", "Supplies"] as const;

export const ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const ISSUE_CATEGORIES = [
  "TECHNICAL",
  "FACILITY",
  "HR",
  "ADMINISTRATIVE",
  "SECURITY",
  "OTHER",
] as const;

export const SUPPLIES_CATEGORIES = [
  "OFFICE_Supplies",
  "EQUIPMENT",
  "STATIONERY",
  "PANTRY",
  "CLEANING",
  "TECHNOLOGY",
  "OTHER",
] as const;

// Display labels for enums
export const ISSUE_CATEGORY_LABELS: Record<
  (typeof ISSUE_CATEGORIES)[number],
  string
> = {
  TECHNICAL: "Technical (IT, Software, Hardware)",
  FACILITY: "Facility (Building, Maintenance)",
  HR: "Human Resources",
  ADMINISTRATIVE: "Administrative",
  SECURITY: "Security",
  OTHER: "Other",
};

export const SUPPLIES_CATEGORY_LABELS: Record<
  (typeof SUPPLIES_CATEGORIES)[number],
  string
> = {
  OFFICE_Supplies: "Office Supplies",
  EQUIPMENT: "Equipment",
  STATIONERY: "Stationery",
  PANTRY: "Pantry",
  CLEANING: "Cleaning",
  TECHNOLOGY: "Technology",
  OTHER: "Other",
};

export const ISSUE_PRIORITY_LABELS: Record<
  (typeof ISSUE_PRIORITIES)[number],
  string
> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

// Request validation schema
export const requestSchema = z
  .discriminatedUnion("type", [
    // Issue type
    z.object({
      type: z.literal("ISSUE"),
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be less than 100 characters"),
      description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters"),
      issuePriority: z.enum(ISSUE_PRIORITIES, {
        errorMap: () => ({ message: "Please select a priority" }),
      }),
      issueCategory: z.enum(ISSUE_CATEGORIES, {
        errorMap: () => ({ message: "Please select a category" }),
      }),
      location: z
        .string()
        .max(200, "Location must be less than 200 characters")
        .optional(),
    }),
    // Supplies type
    z.object({
      type: z.literal("Supplies"),
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be less than 100 characters"),
      description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
      SuppliesCategory: z.enum(SUPPLIES_CATEGORIES, {
        errorMap: () => ({ message: "Please select a supplies category" }),
      }),
      itemName: z
        .string()
        .min(2, "Item name must be at least 2 characters")
        .max(100, "Item name must be less than 100 characters"),
    }),
  ]);

export type RequestFormValues = z.infer<typeof requestSchema>;
