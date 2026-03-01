import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-slate-100 text-slate-800 border-slate-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-200 text-slate-800 border-slate-300",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm", config.className)}
    >
      {config.label}
    </Badge>
  );
}
