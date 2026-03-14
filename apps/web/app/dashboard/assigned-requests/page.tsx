"use client";

import { useState, useMemo } from "react";
import { useGetAllRequestsQuery } from "@/hooks/request/useCreateRequest";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  CalendarIcon,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ISSUE_CATEGORY_LABELS,
  SUPPLIES_CATEGORY_LABELS,
} from "@/schemas";

const ITEMS_PER_PAGE = 8;

const PRIORITY_CONFIG = {
  HIGH: { label: "High", icon: ArrowUp, className: "text-red-600 bg-red-50 border-red-200" },
  URGENT: { label: "Urgent", icon: AlertTriangle, className: "text-red-700 bg-red-100 border-red-300" },
  MEDIUM: { label: "Medium", icon: ArrowRight, className: "text-amber-600 bg-amber-50 border-amber-200" },
  LOW: { label: "Low", icon: ArrowDown, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
} as const;

type PriorityKey = keyof typeof PRIORITY_CONFIG;

function PriorityBadge({ priority }: { priority: PriorityKey }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

const normalizePriority = (value: unknown): PriorityKey | null => {
  if (typeof value !== "string") return null;
  const p = value.trim().toUpperCase();
  if (p === "LOW" || p === "MEDIUM" || p === "HIGH" || p === "URGENT") return p;
  if (p === "MED") return "MEDIUM";
  if (p === "CRITICAL") return "URGENT";
  return null;
};

const getCategoryLabel = (req: any) => {
  if (req.type === "ISSUE" && req.issueDetails?.category) {
    const label = ISSUE_CATEGORY_LABELS[req.issueDetails.category as keyof typeof ISSUE_CATEGORY_LABELS];
    if (req.issueDetails.category === "OTHER" && req.issueDetails.otherCategoryDetails) {
      return `${label} (${req.issueDetails.otherCategoryDetails})`;
    }
    return label;
  }
  if (req.type === "SUPPLIES" && req.suppliesDetails?.category) {
    const label = SUPPLIES_CATEGORY_LABELS[req.suppliesDetails.category as keyof typeof SUPPLIES_CATEGORY_LABELS];
    if (req.suppliesDetails.category === "OTHER" && req.suppliesDetails.otherCategoryDetails) {
      return `${label} (${req.suppliesDetails.otherCategoryDetails})`;
    }
    return label;
  }
  return "";
};

export default function AssignedRequestsPage() {
  const { user } = useAuth();
  const { data: allRequests, isLoading } = useGetAllRequestsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter requests assigned to current user (approverId === user.id)
  const assignedRequests = useMemo(() => {
    if (!allRequests || !user?.id) return [];
    return (allRequests as any[]).filter(
      (req: any) => req.approverId === user.id
    );
  }, [allRequests, user?.id]);

  // Apply search + status + type filters
  const filtered = useMemo(() => {
    return assignedRequests.filter((req: any) => {
      const matchesSearch =
        !searchTerm ||
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesType = typeFilter === "all" || req.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assignedRequests, searchTerm, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRequests = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Assigned to Me
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Requests assigned to you for resolution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <span className="text-sm font-semibold text-primary">
              {assignedRequests.length}
            </span>
            <span className="text-xs text-muted-foreground">Total Assigned</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-muted/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, ID, or requester..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 transition-all border-none shadow-inner"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[130px] bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ISSUE">Issue</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
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

      {/* Request List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters
                ? "No assigned requests match your filters."
                : "No requests have been assigned to you yet."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-3"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {paginatedRequests.map((req: any) => {
              const issuePriority = normalizePriority(
                req.issueDetails?.priority ?? req.issuePriority
              );
              const isSupplies = req.type === "SUPPLIES";

              return (
                <Link key={req.id} href={`/dashboard/requests/${req.id}`}>
                  <Card className="group transition-all duration-300 hover:shadow-lg hover:border-primary/30 overflow-hidden">
                    <CardContent className="flex flex-col sm:flex-row p-0 h-full">
                      <div
                        className={cn(
                          "w-2 sm:w-1.5 shrink-0 transition-colors",
                          isSupplies ? "bg-blue-500" : "bg-orange-500"
                        )}
                      />

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
                                "flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full shadow-sm",
                                isSupplies
                                  ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                                  : "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                              )}
                            >
                              <div
                                className={cn(
                                  "h-1 w-1 rounded-full animate-pulse",
                                  isSupplies ? "bg-blue-500" : "bg-orange-500"
                                )}
                              />
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
                                <span className="font-semibold text-foreground/80">
                                  {req.user?.name ?? "Unknown"}
                                </span>
                              </div>
                              {isSupplies && req.suppliesDetails?.itemName && (
                                <>
                                  <span className="text-muted-foreground/30">•</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md tracking-tight">
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
                              {format(new Date(req.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>

                          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-border group-hover:bg-primary group-hover:text-white transition-all">
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
                    )
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
