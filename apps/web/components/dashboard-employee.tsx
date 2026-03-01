"use client";
import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  useAnnouncements,
  useLunchTokens,
} from "@/lib/queries";
import { useServiceRequests } from "@/hooks/request/useServiceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { useLunchContext } from "@/lib/lunch/lunchContext";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Megaphone,
  UtensilsCrossed,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useGetAllRequestsQuery } from "@/hooks/request/useCreateRequest";

const PRIORITY_CONFIG = {
  HIGH: { label: "High", icon: ArrowUp, className: "text-red-600 bg-red-50" },
  URGENT: {
    label: "Urgent",
    icon: ArrowUp,
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

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { totalTokens, totalAttending, totalVegetarian, totalNonVegetarian } =
    useLunchContext();

  const { data: allRequests, isLoading: requestsLoading } =
    useGetAllRequestsQuery();

  const { data: announcements, isLoading: annLoading } = useAnnouncements();

  const pending =
    allRequests?.filter((r) => r.status === "PENDING").length ?? 0;
  const inProgress =
    allRequests?.filter((r) => r.status === "IN_PROGRESS").length ?? 0;
  // Counts for requests in different states
  const onhold =
    allRequests?.filter((r) => r.status === "ON_HOLD").length ?? 0;
  const rejected =
    allRequests?.filter((r) => r.status === "REJECTED").length ?? 0;
  const total = allRequests?.length ?? 0;

  const [search, setSearch] = useState("");

  // ✅ Show ONLY user's requests in "Your Recent Requests"
  const userRequests =
    allRequests?.filter((r) => r.user?.id === user?.id) ?? [];

  const recentRequests =
    userRequests
      ?.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.id.toString().toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 5) ?? [];

  const pinnedAnnouncements =
    announcements?.filter((a) => a.pinned).slice(0, 2) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* ✅ Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is a summary of your service requests.
        </p>
      </div>

      {/* ✅ Search + New Request */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={(e) => e.preventDefault()} className="flex-1">
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>

        <div className="flex gap-2">
          <Link href="/dashboard/requests/new">
            <Button className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {requestsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="flex items-center justify-center p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">Total</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{total}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">My Requests</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Wait</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{pending}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Hold</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{onhold}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">On-Hold</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Work</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{inProgress}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-red-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Fail</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{rejected}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Rejected</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Requests & Announcements */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Your Recent Requests
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/requests"
                className="text-xs text-muted-foreground"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests yet. Create your first request.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-white shadow-sm">
                {recentRequests.map((req) => (
                  <Link
                    key={req?.id}
                    href={`/dashboard/requests/${req?.id}`}
                    className="group flex items-center justify-between px-4 py-4 transition-all duration-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {req.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>{format(new Date(req.createdAt), "MMM d, h:mm a")}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] uppercase opacity-70">RE-{req.id.slice(0, 6)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.type === "ISSUE" && req.issueDetails?.priority && (
                        <PriorityBadge priority={req.issueDetails.priority} />
                      )}
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/announcements"
                className="text-xs text-muted-foreground"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {annLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : pinnedAnnouncements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No announcements.
              </p>
            ) : (
              <div className="space-y-4">
                {pinnedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="group flex items-start gap-4 rounded-xl border border-border p-4 transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {ann.title}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {ann.content}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
