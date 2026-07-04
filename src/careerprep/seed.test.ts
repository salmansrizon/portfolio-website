// @vitest-environment node
//
// Question Library validation harness.
// Every SQL Question's schema + seed data + official solution is executed
// against PGLite — the exact engine candidates run in the browser — so a
// broken official solution can never ship. Structural invariants guard
// MCQs, Missions, and slugs. This suite stays in place to validate every
// future tranche and question edit.

import { describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { allSeedQuestions } from "../../supabase/seed/careerprep";

const sqlQuestions = allSeedQuestions.filter(
  (q) => q.question_type === "code" || q.question_type === "case_study",
);
const mcqs = allSeedQuestions.filter((q) => q.question_type === "mcq");
const roots = allSeedQuestions.filter((q) => q.question_type === "root");
const children = allSeedQuestions.filter((q) => q.parent_slug);

// One PGLite instance per dataset — solutions are read-only, so questions
// sharing a world can share a booted database.
const dbCache = new Map<string, Promise<PGlite>>();
function dbFor(q: (typeof sqlQuestions)[number]): Promise<PGlite> {
  const key = q.dataset ?? q.slug;
  let db = dbCache.get(key);
  if (!db) {
    db = (async () => {
      const pg = new PGlite();
      await pg.exec(q.schema_sql);
      await pg.exec(q.initial_sql);
      return pg;
    })();
    dbCache.set(key, db);
  }
  return db;
}

describe("Question Library — every official solution runs on PGLite", () => {
  for (const q of sqlQuestions) {
    it(`${q.slug} (${q.difficulty} ${q.industry} ${q.question_type})`, async () => {
      expect(q.schema_sql.length, "SQL questions must have a schema").toBeGreaterThan(0);
      expect(q.initial_sql.length, "SQL questions must have seed data").toBeGreaterThan(0);
      const db = await dbFor(q);
      const result = await db.query(q.solution_sql);
      expect(result.rows.length, "official solution must return rows").toBeGreaterThan(0);
    });
  }
});

describe("Question Library — MCQ invariants", () => {
  for (const q of mcqs) {
    it(q.slug, () => {
      expect(q.options, "MCQ needs options").toBeDefined();
      expect(q.options!.map((o) => o.label)).toEqual(["A", "B", "C", "D"]);
      expect(q.options!.every((o) => o.text.trim().length > 0)).toBe(true);
      expect(["A", "B", "C", "D"]).toContain(q.correct_option);
    });
  }
});

describe("Question Library — Mission invariants", () => {
  it("every Mission root has at least one child, ordered from 0 without gaps", () => {
    expect(roots.length).toBeGreaterThan(0);
    for (const root of roots) {
      const kids = children
        .filter((c) => c.parent_slug === root.slug)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      expect(kids.length, `Mission ${root.slug} has no children`).toBeGreaterThan(0);
      kids.forEach((kid, i) => {
        expect(kid.order_index, `${kid.slug} order_index`).toBe(i);
        expect(kid.question_type, "Mission children are code questions").toBe("code");
      });
    }
  });

  it("every child references an existing Mission root", () => {
    const rootSlugs = new Set(roots.map((r) => r.slug));
    for (const c of children) {
      expect(rootSlugs.has(c.parent_slug!), `${c.slug} → ${c.parent_slug}`).toBe(true);
    }
  });
});

describe("Question Library — slugs and required fields", () => {
  it("slugs are unique and kebab-case", () => {
    const seen = new Set<string>();
    for (const q of allSeedQuestions) {
      expect(q.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(seen.has(q.slug), `duplicate slug ${q.slug}`).toBe(false);
      seen.add(q.slug);
    }
  });

  it("every question has title, content, category, and a valid difficulty/industry", () => {
    for (const q of allSeedQuestions) {
      expect(q.title.trim().length).toBeGreaterThan(0);
      expect(q.content_md.trim().length).toBeGreaterThan(0);
      expect(q.category.trim().length).toBeGreaterThan(0);
      expect(["Easy", "Medium", "Hard"]).toContain(q.difficulty);
      expect(["Fintech", "E-Commerce", "Logistics", "Telco"]).toContain(q.industry);
    }
  });

  it("SQL hints exist on every code/case_study question (2–3 progressive hints)", () => {
    for (const q of sqlQuestions) {
      expect(q.hints!.length, `${q.slug} hints`).toBeGreaterThanOrEqual(2);
      expect(q.hints!.length, `${q.slug} hints`).toBeLessThanOrEqual(3);
    }
  });
});
