// ── Discriminated union for BlogContent ─────────────────────────────────────
// Each content block type has its own required fields, enforced at compile time.
// Import this from BlogContentRenderer for the full type.

export type BlogContent =
  | { type: 'text'; content: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'image'; url: string; alt?: string; caption?: string }
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; content: string; attribution?: string }
  | { type: 'divider' }
  | { type: string; [key: string]: unknown }; // Unknown types: extensible

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