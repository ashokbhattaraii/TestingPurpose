"use client";

import { useAuth } from "@/lib/auth-context";
import { useServiceRequests } from "@/queries/request/useServiceRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
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
  Users,
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
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
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

export default function MyRequestsPage() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useServiceRequests(user?.id);

  const allRequests = requests ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered =
    allRequests.filter((req: any) => {
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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedRequests = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getCategoryLabel = (req: any) => {
    if (req.type === "ISSUE" && req.issueDetails?.category) {
      const label = ISSUE_CATEGORY_LABELS[
        req.issueDetails.category as keyof typeof ISSUE_CATEGORY_LABELS
      ];
      if (req.issueDetails.category === "OTHER" && req.issueDetails.otherCategoryDetails) {
        return `${label}-(${req.issueDetails.otherCategoryDetails})`;
      }
      return label;
    }
    if (req.type === "SUPPLIES" && req.suppliesDetails?.category) {
      const label = SUPPLIES_CATEGORY_LABELS[
        req.suppliesDetails.category as keyof typeof SUPPLIES_CATEGORY_LABELS
      ];
      if (req.suppliesDetails.category === "OTHER" && req.suppliesDetails.otherCategoryDetails) {
        return `${label}-(${req.suppliesDetails.otherCategoryDetails})`;
      }
      return label;
    }
    return "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Requests
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Track and manage service requests you have created.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/requests/new">
            <Plus className="mr-1 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-muted/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your requests..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-card/50 dark:bg-muted/50 focus:bg-card dark:focus:bg-muted transition-all border-none shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "group justify-start gap-2 text-left font-normal bg-card/50 dark:bg-muted/50 hover:bg-card dark:hover:bg-muted transition-all",
                      !dateRange && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                    {dateRange?.from ? (
                      <div className="flex items-center gap-1.5">
                        <span className="max-w-[150px] truncate text-foreground font-medium">
                          {dateRange.to ? (
                            `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                          ) : (
                            format(dateRange.from, "MMM d, yyyy")
                          )}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDateChange(undefined);
                          }}
                          className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span>Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateChange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px] bg-card/50 dark:bg-muted/50 hover:bg-card dark:hover:bg-muted">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ON_HOLD">On-Hold</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[130px] bg-card/50 dark:bg-muted/50 hover:bg-card dark:hover:bg-muted">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ISSUE">Issue</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies</SelectItem>
                </SelectContent>
              </Select>

              {(search || statusFilter !== "all" || typeFilter !== "all" || dateRange) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setDateRange(undefined);
                  }}
                  className="h-9 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid gap-3">
            {paginatedRequests.map((requestItem) => {
              const req = requestItem as any;
              const issuePriority = normalizePriority(
                req.issueDetails?.priority ?? req.issuePriority,
              );
              const isSupplies = req.type === "SUPPLIES";

              return (
                <Link key={req.id} href={`/requests/${req.id}`}>
                  <Card className="group transition-all duration-300 hover:shadow-lg hover:border-primary/30 overflow-hidden">
                    <CardContent className="flex flex-col sm:flex-row p-0 h-full">
                      <div className={cn(
                        "w-2 sm:w-1.5 shrink-0 transition-colors",
                        isSupplies ? "bg-blue-500" : "bg-orange-500"
                      )} />

                      <div className="flex flex-col flex-1 gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80 bg-muted px-2.5 py-0.5 rounded-md">
                              {req.id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 px-2.5 py-0.5 border border-border rounded-md shadow-sm">
                              {getCategoryLabel(req)}
                            </span>
                            <span
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full shadow-sm hover:shadow transition-shadow",
                                isSupplies
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-orange-50 text-orange-700 border border-orange-200"
                              )}
                            >
                              <div className={cn("h-1 w-1 rounded-full animate-pulse", isSupplies ? "bg-blue-500" : "bg-orange-500")} />
                              {isSupplies ? "Supplies" : "Issue"}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {req.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span className="font-semibold text-foreground/80">{req.user?.name ?? req.createdByName ?? "You"}</span>
                              </div>
                              {isSupplies && req.suppliesDetails?.itemName && (
                                <>
                                  <span className="text-muted-foreground/30">•</span>
                                  <span className="font-medium text-foreground/80 bg-muted px-2.5 py-0.5 rounded-md tracking-tight">
                                    Item: {req.suppliesDetails.itemName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-border sm:pt-0 sm:border-none">
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2">
                              {req.type === "ISSUE" && issuePriority && (
                                <PriorityBadge priority={issuePriority} />
                              )}
                              <StatusBadge status={req.status} />
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                              <CalendarIcon className="h-4 w-4" />
                              {formatRequestDate(req.createdAt)}
                            </div>
                          </div>

                          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-border group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Entries per page</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
