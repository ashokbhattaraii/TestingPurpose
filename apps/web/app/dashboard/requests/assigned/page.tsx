"use client";

import { useGetAllRequestsQuery } from "@/hooks/request/useCreateRequest";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignedRequestsPage() {
  const { user } = useAuth();
  const { data: allRequests, isLoading } = useGetAllRequestsQuery();

  // Admin lai assign bhayeko request filter garne logic
  const assignedToMe = allRequests?.filter((r: any) => r.assignedToId === user?.id) ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Assigned to Me
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage all requests currently assigned to you.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : assignedToMe.length === 0 ? (
            <div className="py-20 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">No assigned requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-border text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Request ID</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Requested By</th>
                    <th className="px-6 py-4 font-semibold">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assignedToMe.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] uppercase text-slate-500">
                        RE-{req.id.slice(0, 6)}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/dashboard/requests/${req.id}`} 
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {req.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {req.user?.name || "User"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(req.createdAt), "MMM d, yyyy")}
                      </td>
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