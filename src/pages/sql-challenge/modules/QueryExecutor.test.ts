import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { executeQuery, useQueryExecutor } from './QueryExecutor';

// executeQuery/useQueryExecutor's happy path runs real queries through a real
// PGlite (WASM) instance — repeatedly booting one inside a vitest worker
// exhausts the worker's heap and crashes the run (see PGliteEngine.test.ts).
// That path is verified against a real browser instead (ticket #73's manual
// smoke test and the Playwright UAT pass). Here we only cover the behavior
// that doesn't require a booted instance.
describe('QueryExecutor', () => {
  it('executeQuery reports an error when PGlite has not been booted', async () => {
    const result = await executeQuery('SELECT 1;');

    expect(result.error).toBe('PGlite not initialized');
    expect(result.rows).toEqual([]);
  });

  it('useQueryExecutor starts idle with no results', () => {
    const { result } = renderHook(() => useQueryExecutor());

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.results).toBeNull();
  });
});
