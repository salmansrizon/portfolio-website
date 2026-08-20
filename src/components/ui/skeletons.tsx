import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Shared loading shapes.
//
// A skeleton beats a spinner because it says *what* is coming and reserves the
// space for it: the page does not jump when data lands, and a slow connection
// still shows a page rather than a void with something spinning in it.
//
// Each shape mirrors the real component's proportions. A skeleton that does not
// match what replaces it is just a different kind of flicker.

/** One row in a list — icon, two lines of text, an action. */
export const RowSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="grid gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="flex items-center gap-3 p-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        </CardContent>
      </Card>
    ))}
  </div>
);

/** A grid or carousel of content cards — image band, title, meta, button. */
export const CardGridSkeleton = ({ count = 3, className = '' }: { count?: number; className?: string }) => (
  <div className={className || 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border border-border/50">
        <Skeleton className="h-[160px] w-full rounded-none" />
        <div className="space-y-3 p-5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

/** The Topic page: title, explanation card, then its sections. */
export const TopicSkeleton = () => (
  <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">
    <Skeleton className="mb-4 h-8 w-32 rounded-full" />
    <Skeleton className="mb-6 h-8 w-2/3" />

    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>

    <div className="mt-6 space-y-1.5">
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

/** The Career Prep lobby: the Journey card, then the cards beneath it. */
export const JourneyPanelSkeleton = () => (
  <section className="container mx-auto max-w-7xl px-4 pb-4">
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="mt-4 h-10 w-56 rounded-full" />
      </CardContent>
    </Card>

    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="mb-6 flex items-center gap-4 rounded-2xl border p-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    ))}
  </section>
);

/** A table of rows — the Library and admin lists. */
export const TableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg border border-border/60 px-4 py-3">
        <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 flex-1" />
        <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
        <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
      </div>
    ))}
  </div>
);
