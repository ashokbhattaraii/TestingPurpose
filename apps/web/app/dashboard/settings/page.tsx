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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Bell, Shield, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const roleLabel: Record<string, string> = {
  EMPLOYEE: "Employee",
  ADMIN: "Admin",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications:
      user?.notificationPreferences?.emailNotifications ?? true,
    announcements: user?.notificationPreferences?.announcements ?? true,
    assignments: user?.notificationPreferences?.assignments ?? true,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setNotificationPrefs(user.notificationPreferences);
    }
  }, [user]);



  const handleSaveNotifications = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Removed toast as per request
    }, 1000);
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-base font-medium text-muted-foreground mt-1">
          Manage your account security, preferences, and privacy settings.
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>
            View your account details and basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <Input
                type="text"
                value={user.name}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
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
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Department
              </Label>
              <Input
                type="text"
                value={user.department ?? "—"}
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
              <Input
                type="text"
                value={user.uid}
                disabled
                className="bg-muted font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                CUID
              </Label>
              <Input
                type="text"
                value={user.cuid ?? "—"}
                disabled
                className="bg-muted font-mono text-xs"
              />
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

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Details</CardTitle>
          <CardDescription>
            Your personal information as recorded in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Gender</Label>
            <Input
              type="text"
              value={user.gender === "M" ? "Male" : user.gender === "F" ? "Female" : user.gender ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Home Phone</Label>
            <Input
              type="text"
              value={user.phone_home ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Work Phone</Label>
            <Input
              type="text"
              value={user.phone_work ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Recovery Phone</Label>
            <Input
              type="text"
              value={user.phone_recovery ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Information</CardTitle>
          <CardDescription>
            Your organization and employment details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Organization Unit</Label>
            <Input
              type="text"
              value={user.org_unit ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Department</Label>
            <Input
              type="text"
              value={user.department ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Job Title</Label>
            <Input
              type="text"
              value={user.job_title ?? "—"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Employment Type</Label>
            <Input
              type="text"
              value={user.employment_type ?? "—"}
              disabled
              className="bg-muted capitalize"
            />
          </div>
        </CardContent>
      </Card>



      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                Notification Preferences
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider h-5">
                Upcoming
              </Badge>
            </div>
          </div>
          <CardDescription className="ml-7">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <Switch
                checked={notificationPrefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    emailNotifications: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Announcements
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about new office announcements
                </p>
              </div>
              <Switch
                checked={notificationPrefs.announcements}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    announcements: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Task Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're assigned to tasks
                </p>
              </div>
              <Switch
                checked={notificationPrefs.assignments}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    assignments: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveNotifications}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
            <Badge variant="outline" className="hidden sm:flex text-[10px] font-semibold uppercase text-muted-foreground border-muted-foreground/20">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider h-5">
                Upcoming
              </Badge>
            </div>
          </div>
          <CardDescription className="ml-7">
            Control your privacy and visibility settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-900 mb-2">
              Privacy Notice
            </p>
            <p className="text-xs text-amber-800">
              Your profile information is visible to other team members within
              the organization. Contact your administrator to request additional
              privacy restrictions.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">
                  Show Profile to Team
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow team members to view your profile
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">
                  Show Last Login Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display when you last accessed the system
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Save Privacy Settings
            </Button>
            <Badge variant="outline" className="hidden sm:flex text-[10px] font-semibold uppercase text-muted-foreground border-muted-foreground/20">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
