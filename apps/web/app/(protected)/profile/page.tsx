"use client";

import { useAuth } from "@/lib/auth-context";
import { useServiceRequests } from "@/queries/request/useServiceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ConnectedAccounts } from "@/components/connected-accounts";
import {
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  Edit3,
  Link as LinkIcon,
  Phone,
  User as UserIcon,
  Briefcase,
  Globe,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { ServiceRequest } from "@/lib/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabel: Record<string, string> = {
  EMPLOYEE: "Employee",
  ADMIN: "Admin",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: requestsData } = useServiceRequests(user?.id ?? "");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  if (!user) return null;

  const displayName = user.name ?? "User";
  const displayEmail = user.email ?? "—";
  const displayRole = user.is_admin
    ? "Admin"
    : roleLabel[user.roles?.[0] || "EMPLOYEE"] ?? "Employee";
  const displayStatus = user.active ? "Active" : "Inactive";
  const displayDepartment = user.department ?? "N/A";
  const displayGender = user.gender === "M" ? "Male" : user.gender === "F" ? "Female" : user.gender ?? "N/A";
  const displayJobTitle = user.job_title ?? "N/A";
  const displayOrgUnit = user.org_unit ?? "N/A";
  const displayEmploymentType = user.employment_type ?? "N/A";

  const joinedAt = user.created_at
    ? new Date(user.created_at)
    : (user as any).joinedAt
      ? new Date((user as any).joinedAt)
      : null;
  const updatedAt = user.updated_at ? new Date(user.updated_at) : null;
  const lastLogin = (user as any).lastLogin
    ? new Date((user as any).lastLogin)
    : null;

  const socialAccounts = [...((user as any).socialAccounts ?? [])];
  const hasGoogle = socialAccounts.some((acc: any) => acc.provider === "google");
  if (!hasGoogle && user.email) {
    socialAccounts.push({
      provider: "google",
      email: user.email,
      connectedAt: user.created_at || (user as any).joinedAt || new Date().toISOString(),
    });
  }

  const requestsArray = (Array.isArray(requestsData)
    ? requestsData
    : (requestsData as any)?.requests ?? []) as ServiceRequest[];

  const recentRequests = requestsArray.slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Manage your account information and preferences.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              {user.thumbnail_url ? (
                <img
                  src={user.thumbnail_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                {displayRole}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700"
              >
                <CheckCircle className="h-3 w-3" />
                {displayStatus}
              </Badge>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Personal & Professional Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span className="text-sm font-medium">{displayGender}</span>
            </div>
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{user.phone_home ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Organization Unit</span>
              <span className="text-sm font-medium">{displayOrgUnit}</span>
            </div>
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium">{displayDepartment}</span>
            </div>
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Employment Type</span>
              <span className="text-sm font-semibold capitalize">{displayEmploymentType}</span>
            </div>
            <div className="flex items-center justify-between p-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Job Title</span>
              <span className="text-sm font-medium">{displayJobTitle}</span>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Last Login
                </span>
                <span className="text-xs text-muted-foreground">
                  {lastLogin
                    ? format(lastLogin, "MMM d, yyyy 'at' h:mm a")
                    : "Never"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Account Created
                </span>
                <span className="text-xs text-muted-foreground">
                  {joinedAt ? format(joinedAt, "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Last Updated
                </span>
                <span className="text-xs text-muted-foreground">
                  {updatedAt ? format(updatedAt, "MMM d, yyyy 'at' h:mm a") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Social Accounts */}
      <ConnectedAccounts accounts={socialAccounts} />

      {/* Request History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Recent Service Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={user?.roles?.includes("ADMIN") ? "/requests" : "/my-requests"}
              className="text-xs text-muted-foreground"
            >
              View all
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="py-8 text-center">
              <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No service requests yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first request to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentRequests.map((req: any) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {req.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {req.id} -{" "}
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
