export interface RoadmapNode {
  /** Author-stable Step slug. Never positional — see the note below. */
  id: string;
  title: string;
  level: number; // 1=h1, 2=h2, 3=h3, etc.
  content: string[]; // list items / paragraphs under this heading
  children: RoadmapNode[];
}

/** `## Window Functions {#window-functions}` → captures the slug. */
const SLUG_SUFFIX = /\s*\{#([a-z0-9][a-z0-9-]*)\}\s*$/i;

/**
 * Short, stable, deterministic hash of a title. Used when a heading slugifies to
 * nothing — which happens for any non-Latin script, and these roadmaps contain
 * Bengali headings. Without it those Steps would all collapse to `step`,
 * `step-2`, … i.e. positional ids again, and positional ids are the exact
 * fragility the `{#slug}` scheme exists to remove.
 */
function hashTitle(title: string): string {
  let h = 5381;
  for (let i = 0; i < title.length; i++) h = ((h << 5) + h + title.charCodeAt(i)) | 0;
  return `s-${(h >>> 0).toString(36)}`;
}

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return slug || hashTitle(title);
}

/**
 * Parses markdown into a tree of RoadmapNodes based on headings.
 * H1 = root, H2 = main sections, H3 = sub-topics, etc.
 * List items under a heading become its content.
 *
 * Step identity comes from an author-written `{#slug}` on the heading, falling
 * back to a slug derived from the title. It used to be a positional counter
 * (`node-1`, `node-2`, …), which meant inserting one heading silently shifted
 * every id below it — and learner progress is keyed on these, so that would
 * orphan it. Duplicates are disambiguated with a numeric suffix so a tree always
 * has unique ids even if an author repeats a title.
 */
export function parseRoadmapMarkdown(md: string): RoadmapNode[] {
  const lines = md.split('\n');
  const root: RoadmapNode = { id: 'root', title: 'Root', level: 0, content: [], children: [] };
  const stack: RoadmapNode[] = [root];
  const seen = new Map<string, number>();

  const uniqueId = (base: string) => {
    const key = base || 'step';
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    return n === 0 ? key : `${key}-${n + 1}`;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const raw = headingMatch[2].trim();

      const slugMatch = raw.match(SLUG_SUFFIX);
      const title = raw.replace(SLUG_SUFFIX, '').replace(/^\d+\.\s*/, '').trim();

      const node: RoadmapNode = {
        id: uniqueId(slugMatch ? slugMatch[1].toLowerCase() : slugifyTitle(title)),
        title,
        level,
        content: [],
        children: [],
      };

      // Pop stack until we find a parent with lower level
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
      continue;
    }

    // Preserve raw lines (bullets, table rows, paragraphs) so BlockMarkdown can render them.
    // Skip horizontal rules.
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[-*_]{3,}$/.test(trimmed)) continue;
    if (stack.length > 1) {
      stack[stack.length - 1].content.push(line.replace(/\s+$/, ''));
    }
  }

  return root.children;
}

/** Leaf Steps only — parents are grouping and complete when their children do. */
export function leafSteps(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.flatMap((n) => (n.children.length === 0 ? [n] : leafSteps(n.children)));
}
