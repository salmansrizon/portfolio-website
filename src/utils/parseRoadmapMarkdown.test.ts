import { describe, it, expect } from 'vitest';
import { parseRoadmapMarkdown, leafSteps, slugifyTitle } from './parseRoadmapMarkdown';

// Step identity is the whole point of these tests. Learner progress is keyed on
// `id`, so an id that moves when the document is edited silently orphans it —
// which is exactly what the old positional `node-1`, `node-2` scheme did.

describe('parseRoadmapMarkdown — Step identity', () => {
  it('uses an explicit {#slug} when the author writes one', () => {
    const [step] = parseRoadmapMarkdown('## Window Functions {#window-functions}');
    expect(step.id).toBe('window-functions');
    expect(step.title).toBe('Window Functions');
  });

  it('falls back to a slug derived from the title', () => {
    const [step] = parseRoadmapMarkdown('## Common Table Expressions');
    expect(step.id).toBe('common-table-expressions');
  });

  it('keeps ids stable when a heading is inserted above', () => {
    const before = parseRoadmapMarkdown('## Joins\n## Window Functions');
    const after = parseRoadmapMarkdown('## Filtering\n## Joins\n## Window Functions');

    const idOf = (nodes: ReturnType<typeof parseRoadmapMarkdown>, title: string) =>
      nodes.find((n) => n.title === title)!.id;

    // The regression the old positional scheme caused.
    expect(idOf(after, 'Joins')).toBe(idOf(before, 'Joins'));
    expect(idOf(after, 'Window Functions')).toBe(idOf(before, 'Window Functions'));
  });

  it('disambiguates repeated titles rather than colliding', () => {
    const steps = parseRoadmapMarkdown('## Practice\n## Practice');
    expect(steps.map((s) => s.id)).toEqual(['practice', 'practice-2']);
  });

  it('strips a leading list number from the title but not the slug', () => {
    const [step] = parseRoadmapMarkdown('## 3. Aggregations {#aggregations}');
    expect(step.title).toBe('Aggregations');
    expect(step.id).toBe('aggregations');
  });
});

describe('parseRoadmapMarkdown — structure', () => {
  it('nests by heading level and collects content', () => {
    const nodes = parseRoadmapMarkdown('# SQL\n- intro line\n## Joins\n- inner\n- outer');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].title).toBe('SQL');
    expect(nodes[0].content).toEqual(['- intro line']);
    expect(nodes[0].children[0].title).toBe('Joins');
    expect(nodes[0].children[0].content).toEqual(['- inner', '- outer']);
  });

  it('ignores horizontal rules and blank lines', () => {
    const nodes = parseRoadmapMarkdown('## A\n\n---\n- kept');
    expect(nodes[0].content).toEqual(['- kept']);
  });

  it('leafSteps returns only childless nodes', () => {
    const nodes = parseRoadmapMarkdown('# Root\n## A\n### A1\n### A2\n## B');
    expect(leafSteps(nodes).map((s) => s.title)).toEqual(['A1', 'A2', 'B']);
  });
});

describe('slugifyTitle', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyTitle('Window Functions & CTEs')).toBe('window-functions-ctes');
  });

  it('trims stray separators', () => {
    expect(slugifyTitle('  -- Joins --  ')).toBe('joins');
  });

  // These roadmaps contain Bengali headings, which strip to nothing.
  it('falls back to a stable hash for non-Latin titles', () => {
    const bengali = 'ডেটা অ্যানালিস্ট হওয়ার জন্য কি নির্দিষ্ট কোর্স লাগে?';
    const id = slugifyTitle(bengali);
    expect(id).not.toBe('');
    expect(id).toMatch(/^s-[a-z0-9]+$/);
    expect(slugifyTitle(bengali)).toBe(id); // deterministic
  });

  it('gives different non-Latin titles different ids', () => {
    expect(slugifyTitle('এই কাজে কতটা কোডিং জানতে হয়?')).not.toBe(slugifyTitle('উপসংহার'));
  });
});

describe('non-Latin headings keep stable ids', () => {
  it('does not collapse Bengali headings onto positional ids', () => {
    const md = '## ডেটা অ্যানালিস্ট\n## এই কাজে কতটা কোডিং\n## উপসংহার';
    const ids = parseRoadmapMarkdown(md).map((n) => n.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids.some((id) => id === 'step' || id === 'step-2')).toBe(false);
  });
});
