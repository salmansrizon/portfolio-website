import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * StatusPill — compact state chip used across the app (enrollment status,
 * course status, payment state, etc.). Semantic color is paired with the
 * label text so meaning never relies on color alone.
 */
const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-wide whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "bg-success-soft text-success-strong",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        neutral: "bg-panel-2 text-muted-foreground border border-border",
        accent: "bg-primary/10 text-primary",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-[11px] px-2.5 py-1",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  }
);

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  /** show a leading dot in the tone color */
  dot?: boolean;
}

export function StatusPill({ className, tone, size, dot, children, ...props }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ tone, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { statusPillVariants };
