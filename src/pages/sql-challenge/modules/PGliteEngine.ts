import { PGlite } from '@electric-sql/pglite';

// ── PGliteEngine ────────────────────────────────────────────────────────────
// Internal module: manages PGlite instance lifecycle (boot, seed, close).
// Used by SQLChallenge.tsx. Not exported as a public interface — internal helper.

let instance: PGlite | null = null;
let seededSqlSet = new Set<string>();

export async function bootPGlite(schemaSql: string, initialSql: string): Promise<PGlite> {
  if (instance) {
    // If already booted with same SQL, reuse
    const fullSql = (schemaSql || '') + (initialSql || '');
    if (seededSqlSet.has(fullSql)) return instance;
  }

  // Create new instance
  instance = new PGlite();
  await instance.waitReady;

  // Seed schema + initial data
  if (schemaSql) await instance.exec(schemaSql);
  if (initialSql) await instance.exec(initialSql);

  const fullSql = (schemaSql || '') + (initialSql || '');
  seededSqlSet.add(fullSql);

  return instance;
}

export function getPGliteInstance(): PGlite | null {
  return instance;
}

export async function closePGlite() {
  if (instance) {
    try {
      await instance.close();
    } catch (e) {
      console.error('Error closing PGlite:', e);
    }
    instance = null;
    seededSqlSet = new Set();
  }
}

export function isPGliteReady(): boolean {
  return instance !== null;
}
