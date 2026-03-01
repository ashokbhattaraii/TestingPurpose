"use client";

import { useAuth } from "@/lib/auth-context";
import {
  useUsers,
  useAnalytics,
} from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/users/useGetUser";
import {
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetAllRequestsQuery } from "@/hooks/request/useCreateRequest";
import { useLunchContext } from "@/lib/lunch/lunchContext";
import { RequestResponse } from "@/lib/type/requestType";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";

export function SuperadminDashboard() {
  const { user } = useAuth();
  const { data: allRequests, isLoading: requestsLoading } = useGetAllRequestsQuery();
  const { data: adminData, isLoading: userLoading } = useGetUser();
  const { data: usersData } = useUsers();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const { totalTokens: tokenCount, attendanceSummary } = useLunchContext();
  const tokenLoading = !attendanceSummary;

  const total = allRequests?.length ?? 0;
  const totalUsers = usersData?.length ?? 0;
  const avgTime = analytics?.avgResolutionTimeHours ?? 0;

  // Show admin's own requests if any
  const userRequests = allRequests?.filter((r: RequestResponse) => r.user?.id === user?.id) ?? [];
  const recentUserRequests = userRequests.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            System Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor operations and system-wide metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-1 h-4 w-4" />
              Full Analytics
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/users">
              <Users className="mr-1 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {requestsLoading || userLoading || analyticsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="flex items-center justify-center p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 h-32">
              <CardContent className="flex flex-col justify-between p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{total}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Requests
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 h-32">
              <CardContent className="flex flex-col justify-between p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Active</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{totalUsers}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 h-32">
              <CardContent className="flex flex-col justify-between p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Avg</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{avgTime}h</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Resolution Time
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 h-32">
              <CardContent className="flex flex-col justify-between p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{analytics?.resolvedRequests ?? 0}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolved Today</p>
                </div>
              </CardContent>
            </Card>

            <Link href="/dashboard/lunch" className="block h-32">
              <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 h-full">
                <CardContent className="flex flex-col justify-between p-6 h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                      <UtensilsCrossed className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Tokens</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                      {tokenLoading ? "-" : tokenCount}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Today's Count
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Recent Requests sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Your Recent Requests */}
        <Card className="lg:col-span-1">
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
            ) : recentUserRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests found.
              </p>
            ) : (
              <div className="space-y-3">
                {recentUserRequests.map((req: RequestResponse) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/requests/${req.id}`}
                    className="group flex flex-col gap-2 rounded-xl border border-transparent bg-muted/30 p-4 transition-all duration-200 hover:bg-white hover:border-border hover:shadow-md"
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

        {/* System Active Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Recent System Requests
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : allRequests?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests in system.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-white">
                {allRequests?.slice(0, 5).map((req: RequestResponse) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/requests/${req.id}`}
                    className="group flex items-center justify-between px-4 py-4 transition-all duration-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {req.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-slate-700">{req.user?.name}</span>
                          <span>•</span>
                          <span>{format(new Date(req.createdAt), "MMM d")}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] uppercase tracking-tighter opacity-70">{req.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      <div className="h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border shadow-sm">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Requests by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <Skeleton className="h-52" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics?.requestsByMonth ?? []}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214, 20%, 90%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(217, 91%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
