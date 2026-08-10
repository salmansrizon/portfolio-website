import { useState } from 'react';
import { getPGliteInstance } from './PGliteEngine';

// ── QueryExecutor ────────────────────────────────────────────────────────────
// Internal module: executes SQL queries against PGlite instance.
// Used by SQLChallenge.tsx.

export interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
  executionTime?: number;
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  const pg = getPGliteInstance();
  if (!pg) {
    return { columns: [], rows: [], error: 'PGlite not initialized' };
  }

  const startTime = performance.now();
  try {
    const result = await pg.query(sql);
    const endTime = performance.now();

    return {
      columns: result.fields?.map(f => f.name) || [],
      rows: result.rows || [],
      executionTime: Math.round(endTime - startTime),
    };
  } catch (error: any) {
    return {
      columns: [],
      rows: [],
      error: error.message || 'Query execution failed',
    };
  }
}

export function useQueryExecutor() {
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const execute = async (sql: string) => {
    setIsExecuting(true);
    try {
      const result = await executeQuery(sql);
      setResults(result);
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    results,
    isExecuting,
    execute,
  };
}
