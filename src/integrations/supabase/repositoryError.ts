/** The operations the repository seam exposes, named for error reporting. */
export type RepositoryOperation = 'findAll' | 'findById' | 'create' | 'update' | 'delete';

interface Postgrestish {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * A failure crossing the repository seam.
 *
 * Raw Postgrest errors say "duplicate key value violates unique constraint"
 * without saying which table or which operation, which is useless once a screen
 * talks to several repositories. This carries the seam's own context and keeps
 * the original reachable via `cause` for callers that branch on the code.
 */
export class RepositoryError extends Error {
  readonly operation: RepositoryOperation;
  readonly table: string;
  readonly code?: string;

  constructor(operation: RepositoryOperation, table: string, cause: unknown) {
    const detail = (cause as Postgrestish | null)?.message;
    super(detail ? `${table}.${operation} failed: ${detail}` : `${table}.${operation} failed`);

    this.name = 'RepositoryError';
    this.operation = operation;
    this.table = table;
    this.code = (cause as Postgrestish | null)?.code;
    this.cause = cause;
  }
}

/** Wraps a failure unless it is already a RepositoryError. */
export function asRepositoryError(
  operation: RepositoryOperation,
  table: string,
  cause: unknown,
): RepositoryError {
  return cause instanceof RepositoryError ? cause : new RepositoryError(operation, table, cause);
}
