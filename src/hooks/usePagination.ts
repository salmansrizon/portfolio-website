import { useEffect, useMemo, useState } from 'react';

// Paging for admin lists. Ten per page by default: enough that a manager reads
// as a list rather than a preview, few enough that the row height stays
// comfortable and the page does not scroll for a full minute.
//
// The page resets whenever the underlying set shrinks past it — otherwise
// searching while on page 4 leaves an admin staring at an empty table and
// concluding their data is gone.

export interface PaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  /** The slice to render. */
  pageItems: T[];
  /** 1-based index of the first item on this page, for "11–20 of 34". */
  from: number;
  to: number;
}

export function usePagination<T>(items: T[], pageSize = 10): PaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    page,
    setPage,
    pageSize,
    totalPages,
    totalItems,
    pageItems,
    from: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, totalItems),
  };
}
