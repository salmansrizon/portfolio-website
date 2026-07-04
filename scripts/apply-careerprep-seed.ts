/**
 * Applies the Question Library seed to the live database via supabase-js
 * (same anon credentials the app uses; careerprep_questions grants INSERT).
 *
 *   npx vite-node scripts/apply-careerprep-seed.ts
 *
 * Idempotent: existing slugs are skipped, so overlapping tranches are safe.
 * Mission roots insert before children so parent_id can be resolved.
 */
import { createClient } from "@supabase/supabase-js";
import { allSeedQuestions } from "../supabase/seed/careerprep";

const SUPABASE_URL = "https://llmeentlxjauihrkkrjg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbWVlbnRseGphdWlocmtrcmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzg1NTMsImV4cCI6MjA2ODc1NDU1M30.xOrWNt9jkPhI11CFkkFTgFjuH8SNbIjp4oyk3e34vt8";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const table = () => supabase.from("careerprep_questions");

const { data: existingRows, error: fetchErr } = await table().select("slug");
if (fetchErr) throw fetchErr;
const existing = new Set((existingRows ?? []).map((r: any) => r.slug));

const roots = allSeedQuestions.filter((q) => q.question_type === "root");
const rest = allSeedQuestions.filter((q) => q.question_type !== "root");
const slugToId = new Map<string, string>();
let inserted = 0;
let skipped = 0;

for (const q of [...roots, ...rest]) {
  if (existing.has(q.slug)) {
    skipped++;
    if (q.question_type === "root") {
      const { data } = await table().select("id").eq("slug", q.slug).single();
      if (data) slugToId.set(q.slug, (data as any).id);
    }
    continue;
  }
  const parent_id = q.parent_slug ? slugToId.get(q.parent_slug) ?? null : null;
  if (q.parent_slug && !parent_id) throw new Error(`Parent ${q.parent_slug} unresolved for ${q.slug}`);
  const row = {
    slug: q.slug,
    title: q.title,
    question_type: q.question_type,
    difficulty: q.difficulty,
    industry: q.industry,
    category: q.category,
    tags: q.tags ?? [],
    content_md: q.content_md,
    schema_sql: q.schema_sql,
    initial_sql: q.initial_sql,
    solution_sql: q.solution_sql,
    hints: q.hints ?? [],
    options: q.options ?? [],
    correct_option: q.correct_option ?? null,
    parent_id,
    order_index: q.order_index ?? 0,
    time_limit_secs: q.time_limit_secs ?? null,
    success_rate: q.success_rate ?? 50,
  };
  const { data, error } = await table().insert(row).select("id").single();
  if (error) throw new Error(`${q.slug}: ${error.message}`);
  if (q.question_type === "root") slugToId.set(q.slug, (data as any).id);
  inserted++;
}

console.log(`inserted ${inserted}, skipped ${skipped} existing (total in source: ${allSeedQuestions.length})`);
