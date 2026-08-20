import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationResult } from '@/hooks/usePagination';

// One pager for every admin list, so paging behaves identically everywhere.
//
// Renders nothing on a single page: controls that can never do anything are
// noise, and an admin with four projects should not be shown page machinery.

interface Props {
  pagination: PaginationResult<unknown>;
  /** Plural noun for the count line — "questions", "topics", "blog posts". */
  label?: string;
}

const ListPager = ({ pagination, label = 'items' }: Props) => {
  const { page, setPage, totalPages, totalItems, from, to } = pagination;
  if (totalPages <= 1) return null;

  // A window of five around the current page: enough to jump nearby, never so
  // many that 40 pages of buttons wrap across the screen.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p className="text-xs text-muted-foreground">
        {from}–{to} of {totalItems} {label}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline" size="icon" className="h-8 w-8"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8 text-xs"
            onClick={() => setPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline" size="icon" className="h-8 w-8"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ListPager;
