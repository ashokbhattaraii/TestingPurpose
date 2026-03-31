"use client";

import React from "react";

import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Bell, Shield, Copy, Check, Fingerprint, ShieldCheck } from "lucide-react";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  EMPLOYEE: "Employee",
  ADMIN: "Admin",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Account configuration, security identifiers, and preferences.
          </p>
        </div>
        <Button variant="outline" asChild className="bg-transparent">
          <Link href="/profile" className="gap-2">
            View Profile
          </Link>
        </Button>
      </div>

      {/* Account & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Account & Security</CardTitle>
          </div>
          <CardDescription>
            Your account identifiers and security information
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
              <Input
                type="text"
                value={user.is_admin ? "Admin" : roleLabel[user.roles?.[0] || "EMPLOYEE"]}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                UID
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={user.uid}
                  disabled
                  className="bg-muted font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUid}
                  className="px-2 bg-transparent"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Account Status
              </Label>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${user.active ? "bg-green-600" : "bg-red-600"}`} />
                <span className="text-sm capitalize font-medium text-foreground">
                  {user.active ? "Active" : "Inactive"}
                  {user.pending_approval && " (Pending Approval)"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Last Login
              </Label>
              <span className="text-sm text-foreground">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences — Phase 2 */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Coming in Phase 2</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Notification preferences including email alerts, announcement updates, and task assignment notifications will be available in the next release.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary">
              Planned Feature
            </Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg text-muted-foreground">
              Notification Preferences
            </CardTitle>
          </div>
          <CardDescription className="ml-7">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 opacity-40 pointer-events-none select-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email updates about your account</p>
              </div>
              <Switch checked={false} disabled />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Announcements</Label>
                <p className="text-xs text-muted-foreground">Get notified about new office announcements</p>
              </div>
              <Switch checked={false} disabled />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Task Assignments</Label>
                <p className="text-xs text-muted-foreground">Get notified when you&apos;re assigned to tasks</p>
              </div>
              <Switch checked={false} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings — Phase 2 */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Coming in Phase 2</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Privacy controls including profile visibility, login status display, and data sharing preferences will be available in the next release.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary">
              Planned Feature
            </Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg text-muted-foreground">Privacy Settings</CardTitle>
          </div>
          <CardDescription className="ml-7">
            Control your privacy and visibility settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 opacity-40 pointer-events-none select-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Show Profile to Team</Label>
                <p className="text-xs text-muted-foreground">Allow team members to view your profile</p>
              </div>
              <Switch checked={false} disabled />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">Show Last Login Status</Label>
                <p className="text-xs text-muted-foreground">Display when you last accessed the system</p>
              </div>
              <Switch checked={false} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
