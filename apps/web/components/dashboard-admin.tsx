"use client";

import { useAuth } from "@/lib/auth-context";
import { useAnnouncements } from "@/queries/announcement/useAnnouncements";
import { useServiceRequests } from "@/queries/request/useServiceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Plus,
  UtensilsCrossed,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { useLunchAttendanceSummary } from "@/queries/lunch/useLunchAttendance";
import { useLunchContext } from "@/lib/lunch/lunchContext";

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

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: allRequests, isLoading: requestsLoading } =
    useServiceRequests();
  const { data: announcements, isLoading: annLoading } = useAnnouncements();
  const today = new Date().toISOString().split("T")[0];

  const { totalTokens: tokenCount, attendanceSummary } = useLunchContext();
  const tokenLoading = !attendanceSummary;

  const pending =
    allRequests?.filter((r: any) => r.status === "PENDING").length ?? 0;
  const inProgress =
    allRequests?.filter((r: any) => r.status === "IN_PROGRESS").length ?? 0;
  const onhold =
    allRequests?.filter((r: any) => r.status === "ON_HOLD").length ?? 0;
  const rejected =
    allRequests?.filter((r: any) => r.status === "REJECTED").length ?? 0;
  const total = allRequests?.length ?? 0;


  // Show ONLY user's requests for the new "Your Recent Requests" section
  const userRequests =
    allRequests?.filter((r: any) => (r.userId || r.user?.id) === user?.id) ?? [];

  const recentUserRequests = userRequests.slice(0, 5);

  // ✅ Logic: Filter requests assigned to the current admin
  // Line 97 tira yeso garnuhos:
  const assignedToMe = allRequests?.filter((r: any) => r.approverId === user?.id) ?? [];
  const recentAssigned = assignedToMe.slice(0, 5);

  const activeRequests =
    allRequests
      ?.filter((r: any) => r.status === "PENDING")
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Manage and resolve office service requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/requests/new">
              <Plus className="mr-1 h-4 w-4" />
              New Request
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/analytics">
              <BarChart3 className="mr-1 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>


      {/* Stats - All 6 cards in one row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {requestsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Requests</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Work</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{inProgress}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
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

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-yellow-200 h-32">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFD8F] group-hover:bg-[#FFFD8F]/90 transition-colors">
                    <Clock className="h-5 w-5 text-black" />
                  </div>
                  <span className="text-[10px] font-bold text-black bg-[#FFFD8F] px-2 py-0.5 rounded-full">Hold</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{onhold}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">On-Hold</p>
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

            <Link href="/lunch" className="block h-32">
              <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 h-full">
                <CardContent className="flex flex-col justify-between p-5 h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                      <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Lunch</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                      {tokenLoading ? "-" : tokenCount}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tokens</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Your Recent Requests */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Your Recent Requests
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/my-requests"
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
            ) : recentUserRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests found.
              </p>
            ) : (
              <div className="space-y-3">
                {recentUserRequests.map((req: any) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-transparent bg-muted/30 p-4 transition-all duration-200 hover:bg-card hover:border-border hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {req.title}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Requested {format(new Date(req.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ ADDED: Assigned to You Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Assigned to You
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/assigned-requests"
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
            ) : recentAssigned.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests assigned to you.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAssigned.map((req: any) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-transparent bg-primary/5 p-4 transition-all duration-200 hover:bg-card hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {req.title}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase">RE-{req.id.slice(0, 6)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Requests (System-wide) */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Active Requests
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/requests"
                className="text-xs text-muted-foreground"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : activeRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No active requests.
              </p>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((req: any) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-transparent bg-muted/30 p-4 transition-all duration-200 hover:bg-card hover:border-border hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {req.title}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {req.user?.name} • {format(new Date(req.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcements Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Recent Announcements
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/announcements" className="text-xs text-muted-foreground">
              View all
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {annLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.slice(0, 3).map((ann: any) => (
                <div
                  key={ann.id}
                  className="rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-card hover:shadow-sm"
                >
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {ann.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {ann.content || ann.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    <span>{ann.createdBy?.name || "Admin"}</span>
                    <span>{formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No announcements found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}