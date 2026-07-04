import { datasets } from "./datasets";
import { tranche1 } from "./tranche1";
import { tranche2 } from "./tranche2";
import type { SeedQuestion } from "./types";

export type { SeedQuestion } from "./types";
export { datasets } from "./datasets";

/** Fully-expanded row shape matching the careerprep_questions table. */
export interface ExpandedSeedQuestion extends Omit<SeedQuestion, "dataset"> {
  dataset?: string;
  schema_sql: string;
  initial_sql: string;
  solution_sql: string;
}

const tranches: SeedQuestion[][] = [tranche1, tranche2];

function expand(q: SeedQuestion): ExpandedSeedQuestion {
  const world = q.dataset ? datasets[q.dataset] : undefined;
  if (q.dataset && !world) {
    throw new Error(`Question "${q.slug}" references unknown dataset "${q.dataset}"`);
  }
  return {
    ...q,
    schema_sql: world?.schema_sql ?? "",
    initial_sql: world?.initial_sql ?? "",
    solution_sql: q.solution_sql ?? "",
    hints: q.hints ?? [],
    tags: q.tags ?? [],
    success_rate: q.success_rate ?? 50,
    time_limit_secs: q.time_limit_secs ?? null,
  };
}

/** Every seed Question across all tranches, expanded to full table rows. */
export const allSeedQuestions: ExpandedSeedQuestion[] = tranches.flat().map(expand);
