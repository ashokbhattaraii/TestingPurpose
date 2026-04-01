"use client";

import { useAuth } from "@/lib/auth-context";
import { useLunchTokens } from "@/hooks/lunch/useLunchTokens";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
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
  TrendingUp,
  AlertCircle,
  Plus,
  Megaphone,
  UtensilsCrossed,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  User,
  Zap,
  ExternalLink,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
    useServiceRequests();

  const { data: announcements, isLoading: annLoading } = useAnnouncements();


  //  Show ONLY user's requests in "Your Recent Requests"
  const userRequests =
    allRequests?.filter((r: any) => (r.userId || r.user?.id) === user?.id) ?? [];

  const pending =
    userRequests.filter((r: any) => r.status === "PENDING").length ?? 0;
  const inProgress =
    userRequests.filter((r: any) => r.status === "IN_PROGRESS").length ?? 0;
  // Counts for requests in different states
  const onhold =
    userRequests.filter((r: any) => r.status === "ON_HOLD").length ?? 0;
  const rejected =
    userRequests.filter((r: any) => r.status === "REJECTED").length ?? 0;
  const total = userRequests.length ?? 0;

  const recentRequests = userRequests.slice(0, 5);

  const pinnedAnnouncements =
    announcements?.filter((a) => a.pinned).slice(0, 5) ?? [];

  const quickLinks = [
    {
      label: "New Request",
      href: "/requests/new",
      icon: <Plus className="h-4 w-4 text-blue-600" />,
      description: "Submit a new service request",
      color: "bg-blue-50",
    },
    {
      label: "Lunch Token",
      href: "/lunch",
      icon: <UtensilsCrossed className="h-4 w-4 text-orange-600" />,
      description: "Manage your daily lunch",
      color: "bg-orange-50",
    },
    {
      label: "My Requests",
      href: "/my-requests",
      icon: <ClipboardList className="h-4 w-4 text-emerald-600" />,
      description: "Track your active requests",
      color: "bg-emerald-50",
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-4 w-4 text-purple-600" />,
      description: "View your account details",
      color: "bg-purple-50",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4 text-slate-600" />,
      description: "System preferences",
      color: "bg-slate-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ✅ Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Here is a summary of your service requests.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/requests/new">
            <Plus className="mr-1 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>


      {/* Stats */}
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
                    <p className="text-2xl font-bold text-foreground tracking-tight">{totalTokens}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tokens</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Recent Requests, Active Requests & Announcements */}
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
            ) : recentRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests yet. Create your first request.
              </p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req: any) => (
                  <Link
                    key={req?.id}
                    href={`/requests/${req?.id}`}
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

        {/* Quick Links */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:bg-muted/50 hover:border-border hover:shadow-sm"
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                    link.color
                  )}>
                    {link.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {link.description}
                    </span>
                  </div>
                  <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/announcements"
                className="text-xs text-muted-foreground"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {annLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
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
                    className="group flex items-start gap-4 rounded-xl border border-border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {ann.title}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {ann.content}
                      </span>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                        <span>{ann.createdBy?.name || "Admin"}</span>
                        <span>{formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}</span>
                      </div>
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
