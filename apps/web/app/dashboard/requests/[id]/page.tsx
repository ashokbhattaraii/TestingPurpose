"use client";

import { useAuth } from "@/lib/auth-context";
import {
  useServiceRequest,
  useUpdateRequestStatus,
  useAssignRequest,
  useUsers,
  useDeleteRequest,
  useReopenRequest,
} from "@/lib/queries";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { useGetRequestByIdQuery } from "@/hooks/request/useGetRequest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Flag,
  UserPlus,
  Edit2,
  Trash2,
  FileText,
  ImageIcon,
  File,
  Paperclip,
  ClipboardList,
  RotateCcw,
  MessageSquare,
  MapPin,
  Package,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import type { RequestStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
  SUPPLIES_CATEGORY_LABELS,
} from "@/schemas";
import { useGetAdminUser } from "@/hooks/users/useGetUser";
const priorityConfig = {
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-800" },
  HIGH: { label: "High", className: "bg-red-100 text-red-800" },
  URGENT: { label: "Urgent", className: "bg-red-200 text-red-900" },
};

export default function RequestDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { data: adminUser, isLoading: isGetAdminLoading } = useGetAdminUser();

  console.log("Admin User Data:", adminUser);
  const id = params.id as string;
  const { data: requestById, isLoading } = useGetRequestByIdQuery(id);
  const { data: allUsers } = useUsers();
  const updateStatus = useUpdateRequestStatus();
  const assignRequest = useAssignRequest();
  const deleteRequest = useDeleteRequest();
  const reopenRequest = useReopenRequest();
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignTo, setAssignTo] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatDate = (value: any, pattern: string) => {
    if (!value) return "N/A";
    const newDate = new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return newDate;
  };

  const isAdminOrSuper = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isCreator = user?.id === requestById?.request.user.id;
  const request = requestById?.request;

  const handleStatusUpdate = () => {
    if (!newStatus || !request) return;
    if (newStatus === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    updateStatus.mutate(
      {
        id: request.id,
        status: newStatus,
        ...(newStatus === "REJECTED"
          ? { rejectionReason: rejectionReason.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Request status updated to ${newStatus}.`);
          setNewStatus("");
          setRejectionReason("");
        },
      },
    );
  };

  const handleReopen = () => {
    if (!request || !user) return;
    reopenRequest.mutate(
      { id: request.id, userId: user.id, userName: user.name },
      {
        onSuccess: () => {
          toast.success(
            "Request has been reopened. Admins have been notified.",
          );
        },
      },
    );
  };

  const handleAssign = () => {
    if (!assignTo || !request || !user) return;
    const targetUser = Array.isArray(adminUser)
      ? adminUser.find((u: any) => u.id === assignTo)
      : adminUser?.id === assignTo
        ? adminUser
        : null;
    if (!targetUser) return;
    assignRequest.mutate(
      {
        requestId: request.id,
        assignedToId: targetUser.id,
        assignedToName: targetUser.name,
        assignedByName: user.name,
      },
      {
        onSuccess: () => {
          toast.success(
            `Request assigned to ${targetUser.name}. They have been notified.`,
          );
          setAssignTo("");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!request) return;
    deleteRequest.mutate(request.id, {
      onSuccess: () => {
        toast.success("Request deleted successfully.");
        router.push("/dashboard/requests");
      },
      onError: () => {
        toast.error("Failed to delete request.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/dashboard/requests">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-muted-foreground">
                {request.id}
              </span>
              <CardTitle className="text-lg text-foreground">
                {request.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={request?.status as any} />
              {isCreator && request.status === "PENDING" && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/requests/edit/${request.id}`}>
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {request.description && (
            <p className="text-sm leading-relaxed text-foreground">
              {request.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm capitalize text-foreground">
                  {request.type === "SUPPLIES" ? "Supplies Request" : "Issue"}
                </p>
              </div>
            </div>

            {/* Issue-specific details */}
            {request.type === "ISSUE" && request.issueDetails?.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm text-foreground">
                    {ISSUE_CATEGORY_LABELS[
                      request.issueDetails
                        .category as keyof typeof ISSUE_CATEGORY_LABELS
                    ] || request.issueDetails.category}
                  </p>
                </div>
              </div>
            )}

            {request.type === "ISSUE" && request.issueDetails?.priority && (
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${priorityConfig[request.issueDetails.priority]?.className || ""}`}
                  >
                    {ISSUE_PRIORITY_LABELS[request.issueDetails.priority]}
                  </Badge>
                </div>
              </div>
            )}

            {request.type === "ISSUE" && request.issueDetails?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm text-foreground">
                    {request.issueDetails.location}
                  </p>
                </div>
              </div>
            )}

            {/* Supplies-specific details */}
            {request.type === "SUPPLIES" &&
              request.suppliesDetails?.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Supplies Category
                    </p>
                    <p className="text-sm text-foreground">
                      {SUPPLIES_CATEGORY_LABELS[
                        request.suppliesDetails
                          .category as keyof typeof SUPPLIES_CATEGORY_LABELS
                      ] || request.suppliesDetails.category}
                    </p>
                  </div>
                </div>
              )}

            {request.type === "SUPPLIES" &&
              request.suppliesDetails?.itemName && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Item Name</p>
                    <p className="text-sm text-foreground">
                      {request.suppliesDetails.itemName}
                    </p>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requested by</p>
                <p className="text-sm text-foreground">{request.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">
                  {formatDate(request.createdAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason Display */}
          {request.status === "REJECTED" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Request Rejected
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    This request has been rejected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reopen Button for creator when rejected */}
          {isCreator && request.status === "REJECTED" && (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Not satisfied with the rejection?
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    You can reopen this request for further review by the admin
                    team.
                  </p>
                </div>
                <Button
                  onClick={handleReopen}
                  disabled={reopenRequest.isPending}
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {reopenRequest.isPending ? "Reopening..." : "Reopen Request"}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Last updated</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(request.updatedAt, "MMM d, yyyy h:mm a")}
            </p>
          </div>

          {/* Admin: Assign Request */}
          {isAdminOrSuper &&
            request.status !== "APPROVED" &&
            request.status !== "REJECTED" && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Assign To
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(adminUser) ? adminUser : [adminUser])
                        ?.filter((u) => u.id !== request.user.id)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.department})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssign}
                    disabled={!assignTo || assignRequest.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {assignRequest.isPending ? "Assigning..." : "Assign"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The assigned person will be notified automatically.
                </p>
              </div>
            )}

          {/* Admin: Update Status */}
          {isAdminOrSuper &&
            request.status !== "APPROVED" &&
            request.status !== "REJECTED" && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">
                  Update Status
                </p>
                <div className="flex gap-2">
                  <Select
                    value={newStatus}
                    onValueChange={(v) => {
                      setNewStatus(v as RequestStatus);
                      if (v !== "REJECTED") setRejectionReason("");
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={
                      !newStatus ||
                      updateStatus.isPending ||
                      (newStatus === "REJECTED" && !rejectionReason.trim())
                    }
                    size="sm"
                  >
                    {updateStatus.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
                {newStatus === "REJECTED" && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="rejection-reason"
                      className="text-xs font-medium text-destructive"
                    >
                      Rejection Reason (required)
                    </label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Please provide a reason for rejecting this request..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[80px] border-destructive/30 focus-visible:ring-destructive"
                    />
                    {!rejectionReason.trim() && (
                      <p className="text-xs text-destructive">
                        A rejection reason is required before updating the
                        status.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this request? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteRequest.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRequest.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
