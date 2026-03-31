"use client";

import { useAuth } from "@/lib/auth-context";

import { useQueryClient } from "@tanstack/react-query";
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
import {
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleConfig: Record<
  UserRole,
  { label: string; className: string; icon: any }
> = {
  EMPLOYEE: {
    label: "Employee",
    className: "bg-muted text-muted-foreground border-border",
    icon: UserIcon,
  },
  ADMIN: {
    label: "Admin",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Shield,
  },
};

function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  const r = role.toUpperCase();
  if (r === "ADMIN" || r.includes("ADMIN")) return "ADMIN";
  if (r === "EMPLOYEE") return "EMPLOYEE";
  return null;
}

export default function UsersPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { data: allEmployees, isLoading } = useGetUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (user && !normalizeRole(user?.roles?.[0])) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const filteredUsers = useMemo(() => {
    if (!allEmployees) return [];
    return allEmployees.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (u.job_title ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allEmployees, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const currentUserRole = normalizeRole(user?.roles?.[0]);
  const isAdmin = currentUserRole === "ADMIN";

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1 max-w-md">
            View system users and their profiles across the organization.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Active: {allEmployees?.length ?? 0} Users</span>
        </div>
      </div>

      {/* Modern Search & Filters area */}
      <div className="grid gap-4 md:flex md:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name, email, department or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/60 hover:border-border focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 w-full bg-muted/20 animate-pulse rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : paginatedUsers.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/5 py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No users found</h3>
          <p className="text-muted-foreground text-sm max-w-xs px-4">
            {searchQuery
              ? `We couldn't find any users matching "${searchQuery}". Try a different term.`
              : "There are currently no users in the system."}
          </p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-primary"
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider pl-6">
                    User
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">
                    Department
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">
                    Joined
                  </TableHead>
                  <TableHead className="text-right pr-6 text-xs font-bold uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((u) => {
                  const isSelf = u.id === user?.id;
                  const userRole = normalizeRole(u.roles?.[0]) ?? "EMPLOYEE";
                  const config = roleConfig[userRole];
                  const Icon = config.icon;

                  return (
                    <TableRow
                      key={u.id}
                      className="group hover:bg-muted/20 transition-colors border-border/50"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50 shadow-sm ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-primary/10 text-primary text-xs font-bold">
                                {getInitials(u.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">
                                {u.name}
                              </span>
                              {isSelf && (
                                <Badge className="text-[9px] h-4 bg-primary text-primary-foreground px-1.5 py-0 border-0">
                                  Me
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground capitalize">
                            {u.department || "No Dept"}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                            {u.job_title || "Position unset"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${config.className} flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-bold rounded-full`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {formatJoinedAt(u?.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() =>
                              router.push(`/users/${u.id}`)
                            }
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* User Pagination Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredUsers.length}
              </span>{" "}
              professionals
            </span>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Entries per page</Label>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => setItemsPerPage(Number(value))}
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
          </div>



          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 mt-6 px-4 py-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 px-3"
                  title="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          Note: User Directory
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• View all registered users in the system</li>
          <li>• Monitor user departments and roles</li>
          <li>• Admin has system access to view all requests and analytics</li>
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
