"use client";

import { cn } from "@/lib/utils";
import type { ApplicationStatus, PipelineApplication } from "@/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  interview: {
    label: "Interview",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  prepared: {
    label: "Ready",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

const pipelineStatusConfig: Record<
  PipelineApplication["status"],
  { label: string; className: string }
> = {
  prepared: {
    label: "Ready",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  skipped_low_score: {
    label: "Low score",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  error: {
    label: "Error",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function PipelineStatusBadge({
  status,
  className,
}: {
  status: PipelineApplication["status"];
  className?: string;
}) {
  const config = pipelineStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function AutomationStatusBadge({
  status,
}: {
  status: "idle" | "running" | "completed" | "error";
}) {
  const config = {
    idle: { label: "Idle", dot: "bg-zinc-400", className: "text-zinc-600" },
    running: {
      label: "Running",
      dot: "bg-blue-500 animate-pulse",
      className: "text-blue-700",
    },
    completed: {
      label: "Completed",
      dot: "bg-emerald-500",
      className: "text-emerald-700",
    },
    error: { label: "Error", dot: "bg-red-500", className: "text-red-700" },
  }[status];

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", config.className)}>
      <span className={cn("size-2 rounded-full", config.dot)} />
      {config.label}
    </div>
  );
}
