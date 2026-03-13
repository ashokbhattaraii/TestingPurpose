"use client";

import { useState } from "react";
import { useGetAllRequestsQuery } from "@/hooks/request/useCreateRequest";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, ClipboardList, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignedRequestsPage() {
  const { user } = useAuth();
  const { data: allRequests, isLoading } = useGetAllRequestsQuery();
  
  // Search ra Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Logic: Filter by Assigned User + Search Text + Status
  const filteredAssigned = allRequests?.filter((req: any) => {
    const isAssignedToMe = req.assignedToId === user?.id;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    return isAssignedToMe && matchesSearch && matchesStatus;
  }) ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Assigned to Me
          </h1>
          <p className="text-sm text-muted-foreground">Manage your assigned requests.</p>
        </div>

        {/* Search & Filter UI - Yo Ashok dai le khojnu bhayeko logic ho */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or Title..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredAssigned.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-20" />
              No requests found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Request ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Requested By</th>
                    <th className="px-6 py-4 font-semibold">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAssigned.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 uppercase">
                        RE-{req.id.slice(0, 6)}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/requests/${req.id}`} className="font-semibold hover:text-primary transition-colors">
                          {req.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 font-medium">{req.user?.name || "User"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{format(new Date(req.createdAt), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}