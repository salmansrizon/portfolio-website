import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GradientPanel — brand-gradient surface for hero panels and CTA banners.
 * Optional decorative glow in the top-right; renders as any element via `as`.
 */
export interface GradientPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  /** show the soft radial glow (default off) */
  glow?: boolean;
}

export function GradientPanel({
  as: Comp = "div",
  glow = false,
  className,
  children,
  ...props
}: GradientPanelProps) {
  return (
    <Comp
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-brand text-white shadow-pop",
        className
      )}
      {...props}
    >
      {glow && (
        <span
          data-glow
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)" }}
        />
      )}
      {children}
    </Comp>
  );
}
