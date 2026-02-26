"use client";

import { useAuth } from "@/lib/auth-context";
import { useUsers, useUpdateUserRole } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetUser } from "@/hooks/users/useGetUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { format, isValid, parseISO } from "date-fns";
import type { UserRole } from "@/lib/types";
import { Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleBadge: Record<string, string> = {
  employee: "bg-muted text-muted-foreground",
  admin: "bg-blue-100 text-blue-800",
  superadmin: "bg-primary/10 text-primary",
};

const roleLabel: Record<UserRole, string> = {
  EMPLOYEE: "Employee",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  const r = role.toUpperCase();
  if (r === "EMPLOYEE" || r === "ADMIN" || r === "SUPER_ADMIN") return r;
  if (r === "SUPERADMIN") return "SUPER_ADMIN"; // fallback for old values
  return null;
}

export default function UsersPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { data: allEmployees, isLoading } = useGetUser();
  const updateRole = useUpdateUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && !normalizeRole(user?.role)) {
      router.push("/dashboard");
    }
  }, [user, normalizeRole, router]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!allEmployees) return [];
    return allEmployees.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (u.position ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allEmployees, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const currentUserRole = normalizeRole(user?.role);
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  if (!isSuperAdmin) return null;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRole.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => {
          // Refresh current user in case super admin changed their own role
          refreshUser();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all system users and manage their roles. Role changes take effect
          immediately.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Users Count */}
      <div className="text-xs text-muted-foreground">
        Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0} to{" "}
        {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
        {filteredUsers.length} users
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filteredUsers.length === 0 && searchQuery
              ? "No users found matching your search."
              : "No users available."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border">
            <div className="col-span-4 text-xs font-semibold text-muted-foreground">
              User
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted-foreground">
              Department
            </div>
            <div className="col-span-2 text-xs font-semibold text-muted-foreground">
              Joined
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted-foreground text-right">
              Role
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {paginatedUsers.map((u) => {
              const isSelf = u.id === user?.id;
              const userRole = normalizeRole(u.role) ?? "EMPLOYEE";
              return (
                <Card
                  key={u.id}
                  className="overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-4">
                      {/* User Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {u.name}
                            </span>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-primary/10 text-primary flex-shrink-0"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="col-span-3">
                        <span className="text-sm text-foreground">
                          {u.department}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div className="col-span-2">
                        <span className="text-sm text-foreground">
                          {formatJoinedAt(u?.createdAt)}
                        </span>
                      </div>

                      {/* Role Selector */}
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Select
                          value={userRole}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, value as UserRole)
                          }
                          disabled={isSelf || updateRole.isPending}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue placeholder={roleLabel[userRole]} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {u.name}
                            </span>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-primary/10 text-primary"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Department
                          </span>
                          <span className="text-foreground font-medium">
                            {u.department}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined</span>
                          <span className="text-foreground font-medium">
                            {formatJoinedAt(u?.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Role
                        </span>
                        <div className="flex-1" />
                        <Select
                          value={userRole}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, value as UserRole)
                          }
                          disabled={isSelf || updateRole.isPending}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 mt-6 px-4 py-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const diff = Math.abs(page - currentPage);
                      return (
                        diff === 0 ||
                        diff <= 1 ||
                        page === 1 ||
                        page === totalPages
                      );
                    })
                    .map((page, idx, arr) => (
                      <div key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-xs text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900">
          Note: Role Management
        </p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Role changes take effect immediately system-wide</li>
          <li>• You cannot change your own role</li>
          <li>• Super Admin has full system access</li>
          <li>• Admin can manage announcements and view analytics</li>
        </ul>
      </div>
    </div>
  );
}
//  "createdAt": "2026-02-25T07:40:55.484Z",
function formatJoinedAt(value: any) {
  if (!value) return "N/A";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM d, yyyy");
}
