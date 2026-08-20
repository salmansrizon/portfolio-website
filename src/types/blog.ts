import { z } from 'zod';

// ── Blog content blocks ─────────────────────────────────────────────────────
// A closed discriminated union, validated at the parse boundary. It used to
// carry an open `{ type: string; [key: string]: unknown }` member "for
// extensibility" — but nothing rendered those blocks (the renderer's default
// branch dropped them), and the open member defeated narrowing everywhere, so
// every consumer reached for `as any`. Unknown blocks are now dropped once, in
// parseBlogContent, and every reader gets a block it can actually trust.

export const blogContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  // `caption` is written by the editor's code-block form. It predates this
  // schema, so leaving it out would make Zod strip it and lose captions on the
  // next save.
  z.object({ type: z.literal('code'), code: z.string(), language: z.string().optional(), caption: z.string().optional() }),
  z.object({ type: z.literal('image'), url: z.string(), alt: z.string().optional(), caption: z.string().optional() }),
  z.object({ type: z.literal('heading'), level: z.union([z.literal(1), z.literal(2), z.literal(3)]), content: z.string() }),
  z.object({ type: z.literal('list'), items: z.array(z.string()), ordered: z.boolean().optional() }),
  z.object({ type: z.literal('quote'), content: z.string(), attribution: z.string().optional() }),
  z.object({ type: z.literal('divider') }),
]);

export type BlogContent = z.infer<typeof blogContentSchema>;

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: BlogContent[];
  excerpt?: string;
  featured_image?: string;
  published?: boolean;
  source_type?: "local" | "medium" | "linkedin" | "external";
  source_url?: string;
  created_at?: string;
  updated_at?: string;
  categories?: string[];
}