import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — eyebrow + title + optional description, with an optional
 * action slot on the right. Titles sit on the display type scale.
 */
export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)} {...props}>
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
