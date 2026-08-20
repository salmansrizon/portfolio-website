import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatCard — KPI tile: label, value, optional signed delta (color = direction),
 * optional leading icon. Used on the admin dashboard and site stat strips.
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** e.g. "18%" or "+24" — rendered next to a direction arrow */
  delta?: string;
  /** direction drives the delta color: up = success, down = danger */
  deltaDirection?: "up" | "down";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  icon,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-panel p-4 shadow-card",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="font-display text-2xl font-bold text-foreground">{value}</span>
      {delta && (
        <span
          data-testid="stat-delta"
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
            deltaDirection === "up" ? "bg-success-soft text-success-strong" : "bg-danger-soft text-danger"
          )}
        >
          {deltaDirection === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}
