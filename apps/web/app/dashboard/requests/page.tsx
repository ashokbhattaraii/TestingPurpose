"use client";

import { useAuth } from "@/lib/auth-context";
import { useServiceRequests } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { useGetAllRequestsQuery } from "@/hooks/use-createRequest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CalendarIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import { useState } from "react";
import type { RequestStatus } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
  SUPPLIES_CATEGORY_LABELS,
} from "@/schemas";
import useCreateRequestMutation from "@/hooks/use-createRequest";

const ITEMS_PER_PAGE = 6;

const PRIORITY_CONFIG = {
  HIGH: { label: "High", icon: ArrowUp, className: "text-red-600 bg-red-50" },
  URGENT: {
    label: "Urgent",
    icon: AlertTriangle,
    className: "text-red-700 bg-red-100",
  },
  MEDIUM: {
    label: "Med",
    icon: ArrowRight,
    className: "text-amber-600 bg-amber-50",
  },
  LOW: {
    label: "Low",
    icon: ArrowDown,
    className: "text-emerald-600 bg-emerald-50",
  },
} as const;

function PriorityBadge({
  priority,
}: {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

const toValidDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (value && typeof value === "object") {
    const obj = value as {
      toDate?: () => Date;
      $date?: string | number;
      seconds?: number;
      nanoseconds?: number;
      _seconds?: number;
      _nanoseconds?: number;
    };

    if (typeof obj.toDate === "function") {
      const d = obj.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }

    if (obj.$date !== undefined) {
      const d = new Date(obj.$date);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const seconds = obj.seconds ?? obj._seconds;
    const nanoseconds = obj.nanoseconds ?? obj._nanoseconds;
    if (typeof seconds === "number") {
      const ms = seconds * 1000 + Math.floor((nanoseconds ?? 0) / 1_000_000);
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
};

const formatRequestDate = (value: unknown) => {
  const d = toValidDate(value);
  return d ? format(d, "MMM d, yyyy") : "N/A";
};

const normalizePriority = (
  value: unknown,
): "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null => {
  if (typeof value !== "string") return null;
  const p = value.trim().toUpperCase();

  if (p === "LOW" || p === "MEDIUM" || p === "HIGH" || p === "URGENT") return p;
  if (p === "MED") return "MEDIUM";
  if (p === "CRITICAL") return "URGENT";

  return null;
};

export default function RequestsPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";
  const { data: requests, isLoading } = useServiceRequests(
    isEmployee ? user?.id : undefined,
  );
  const { data, isLoading: requestsLoading } = useGetAllRequestsQuery();

  const allRequests = ((
    data as { message?: string; requests?: any[] } | undefined
  )?.requests ??
    requests ??
    []) as any[];

  console.log("👤 Dashboard - Loading:", isLoading || requestsLoading);
  console.log("👤 Dashboard - User:", user);
  console.log("👤 Dashboard - Role:", user?.role);
  console.log("📋 Dashboard - All Requests:", allRequests);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered =
    allRequests.filter((req) => {
      const matchSearch =
        req.title?.toLowerCase().includes(search.toLowerCase()) ||
        req.id?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || req.status === statusFilter;
      const matchType = typeFilter === "all" || req.type === typeFilter;

      let matchDate = true;
      if (dateRange?.from) {
        const reqDate = toValidDate(req.createdAt);
        if (!reqDate) return false;

        if (dateRange.to) {
          matchDate = isWithinInterval(reqDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else {
          matchDate = isSameDay(reqDate, dateRange.from);
        }
      }

      return matchSearch && matchStatus && matchType && matchDate;
    }) ?? [];

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRequests = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };
  const clearDateFilter = () => {
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const getCategoryLabel = (req: any) => {
    if (req.type === "ISSUE" && req.issueDetails?.category) {
      return ISSUE_CATEGORY_LABELS[
        req.issueDetails.category as keyof typeof ISSUE_CATEGORY_LABELS
      ];
    }
    if (req.type === "SUPPLIES" && req.suppliesDetails?.category) {
      return SUPPLIES_CATEGORY_LABELS[
        req.suppliesDetails.category as keyof typeof SUPPLIES_CATEGORY_LABELS
      ];
    }
    return "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Service Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEmployee
              ? "Your submitted service requests."
              : "All service requests across the organization."}
          </p>
        </div>
        {isEmployee && (
          <Button asChild size="sm">
            <Link href="/dashboard/requests/new">
              <Plus className="mr-1 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 text-left font-normal sm:w-auto",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span className="truncate">
                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="truncate">
                    {format(dateRange.from, "MMM d, yyyy")}
                  </span>
                )
              ) : (
                <span>Filter by date</span>
              )}
              {dateRange?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  className="ml-auto rounded-full p-0.5 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateFilter();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      clearDateFilter();
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear date filter</span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ON-HOLD">On-Hold</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ISSUE">Issue</SelectItem>
            <SelectItem value="SUPPLIES">Supplies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No requests found matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {paginatedRequests.map((req) => {
              const issuePriority = normalizePriority(
                req.issueDetails?.priority ?? req.issuePriority,
              );

              return (
                <Link key={req.id} href={`/dashboard/requests/${req.id}`}>
                  <Card className="transition-colors hover:bg-muted/30">
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {req.id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getCategoryLabel(req)}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              req.type === "SUPPLIES"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {req.type === "SUPPLIES" ? "Supplies" : "Issue"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {req.title}
                        </span>
                        {req.type === "SUPPLIES" &&
                          req.suppliesDetails?.itemName && (
                            <span className="text-xs text-muted-foreground">
                              Item: {req.suppliesDetails.itemName}
                            </span>
                          )}
                        <span className="text-xs text-muted-foreground">
                          by {req.user?.name ?? req.createdByName ?? "Unknown"}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRequestDate(req.createdAt)}
                        </span>
                        {req.type === "ISSUE" && issuePriority && (
                          <PriorityBadge priority={issuePriority} />
                        )}
                        <StatusBadge status={req.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
