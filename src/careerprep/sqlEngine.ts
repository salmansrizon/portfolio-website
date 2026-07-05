import { PGlite } from "@electric-sql/pglite";

// The one PGLite orchestrator. Callers never import PGlite or reach the
// instance directly — boot/run/teardown is the entire interface.

export type SqlEngineStatus = "idle" | "booting" | "seeding" | "ready" | "error";

export interface SeedInput {
  schemaSql?: string;
  initialSql?: string;
}

export interface RunResult {
  rows: Record<string, unknown>[];
  columns: string[];
  error: string | null;
}

export interface BootResult {
  error: string | null;
  /** True only when this call actually executed schema/initial SQL (a fresh seed). */
  seeded: boolean;
}

export class SqlExecutionEngine {
  private pg: PGlite | null = null;
  private seededKeys = new Set<string>();
  status: SqlEngineStatus = "idle";

  /**
   * Boots the instance on first call (idempotent) and seeds schema/initial SQL
   * when the combined SQL hasn't been seeded yet in this engine's lifetime —
   * mirrors the original per-mission-step reseed-only-when-new behavior.
   */
  async boot(seed: SeedInput = {}): Promise<BootResult> {
    if (!this.pg) {
      this.status = "booting";
      this.pg = new PGlite();
    }

    const fullSql = (seed.schemaSql || "") + (seed.initialSql || "");
    if (!fullSql || this.seededKeys.has(fullSql)) {
      this.status = "ready";
      return { error: null, seeded: false };
    }

    this.status = "seeding";
    try {
      if (seed.schemaSql) await this.pg.exec(seed.schemaSql);
      if (seed.initialSql) await this.pg.exec(seed.initialSql);
      this.seededKeys.add(fullSql);
      this.status = "ready";
      return { error: null, seeded: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("duplicate key")) {
        this.seededKeys.add(fullSql);
        this.status = "ready";
        return { error: null, seeded: true };
      }
      // Still mark ready so the caller can retry/fix SQL against the live instance.
      this.status = "ready";
      return { error: message, seeded: false };
    }
  }

  async run(sql: string): Promise<RunResult> {
    if (!this.pg) throw new Error("SqlExecutionEngine: boot() must be called before run()");
    try {
      const res = await this.pg.query(sql);
      return {
        rows: res.rows as Record<string, unknown>[],
        columns: res.fields.map((f: { name: string }) => f.name),
        error: null,
      };
    } catch (err) {
      return { rows: [], columns: [], error: err instanceof Error ? err.message : String(err) };
    }
  }

  /** Forgets which schema/initial SQL has been seeded without tearing down the instance or its data — used when a mission restarts (retry) so each step's seed is re-attempted (idempotently) against the same live database. */
  forgetSeeds(): void {
    this.seededKeys.clear();
  }

  async teardown(): Promise<void> {
    try {
      await this.pg?.close();
    } catch {
      // instance may already be closed/torn down — nothing to do
    }
    this.pg = null;
    this.seededKeys.clear();
    this.status = "idle";
  }
}
