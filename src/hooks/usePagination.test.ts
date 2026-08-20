import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

const items = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('usePagination', () => {
  it('shows ten per page by default', () => {
    const { result } = renderHook(() => usePagination(items(34)));
    expect(result.current.pageItems).toHaveLength(10);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.from).toBe(1);
    expect(result.current.to).toBe(10);
  });

  it('reports a partial last page honestly', () => {
    const { result } = renderHook(() => usePagination(items(34)));
    act(() => result.current.setPage(4));
    expect(result.current.pageItems).toEqual([31, 32, 33, 34]);
    expect(result.current.from).toBe(31);
    expect(result.current.to).toBe(34);
  });

  it('pulls the page back when the list shrinks under it', () => {
    // The regression this guards: searching while on page 4 of 4 otherwise
    // leaves an admin looking at an empty table, concluding data is missing.
    const { result, rerender } = renderHook(({ data }) => usePagination(data), {
      initialProps: { data: items(34) },
    });
    act(() => result.current.setPage(4));
    rerender({ data: items(6) });
    expect(result.current.page).toBe(1);
    expect(result.current.pageItems).toHaveLength(6);
  });

  it('handles an empty list without pretending there is a page of results', () => {
    const { result } = renderHook(() => usePagination<number>([]));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageItems).toEqual([]);
    expect(result.current.from).toBe(0);
    expect(result.current.to).toBe(0);
  });
});
