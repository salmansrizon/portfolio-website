import { StatusPill } from "@/components/ui/status-pill";
import { CategoryBadge } from "@/components/ui/category-badge";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { GradientPanel } from "@/components/ui/gradient-panel";

/**
 * Dev-only visual harness for the M0 shared primitives. Mounted at
 * /ui-preview only in development (see App.tsx). Not linked anywhere.
 */
export default function UIPreview() {
  return (
    <div className="min-h-screen bg-paper p-8 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <SectionHeading
          eyebrow="Design foundation · M0"
          title="Shared component primitives"
          description="StatusPill, CategoryBadge, StatCard, SectionHeading, and GradientPanel — the building blocks the site and admin reskins compose from."
          action={<button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop">Action</button>}
        />

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">StatusPill</h3>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="success" dot>Paid</StatusPill>
            <StatusPill tone="warning" dot>Pending</StatusPill>
            <StatusPill tone="danger" dot>Failed</StatusPill>
            <StatusPill tone="accent">Published</StatusPill>
            <StatusPill>Draft</StatusPill>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">CategoryBadge</h3>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category="Web Development" />
            <CategoryBadge category="Data &amp; Analytics" />
            <CategoryBadge category="Career Prep" />
            <CategoryBadge category="Webinar" />
            <CategoryBadge category="Philosophy" />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">StatCard</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Revenue (30d)" value="৳341K" delta="18%" deltaDirection="up" />
            <StatCard label="Enrollments" value={86} delta="9%" deltaDirection="up" />
            <StatCard label="Conversion" value="4.8%" delta="0.3pt" deltaDirection="down" />
            <StatCard label="Active students" value={612} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">GradientPanel</h3>
          <GradientPanel glow className="p-6">
            <p className="font-mono text-xs uppercase tracking-wider opacity-80">Revenue this month</p>
            <p className="font-display text-3xl font-bold">৳210,400</p>
          </GradientPanel>
        </section>
      </div>
    </div>
  );
}
