import React from 'react';
import { CodeBlock, dracula } from 'react-code-blocks';
import { cn } from '@/lib/utils';

// ── Discriminated union for BlogContent ─────────────────────────────────────
// Each content block type has its own required fields, enforced at compile time.
// Unknown types are skipped with a console warning (extensible without type updates).

export type BlogContent =
  | { type: 'text'; content: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'image'; url: string; alt?: string; caption?: string }
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; content: string; attribution?: string }
  | { type: 'divider' }
  // Unknown types: preserve but don't render
  | { type: string; [key: string]: unknown };

// ── Parse raw content from Supabase ────────────────────────────────────────
// Supabase sometimes returns content as a JSON string, sometimes as an array.
// This normalizes it to BlogContent[].

export function parseBlogContent(raw: string | BlogContent[] | null | undefined): BlogContent[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as BlogContent[];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as BlogContent[];
    } catch {
      console.warn('Failed to parse blog content as JSON, returning empty array');
      return [];
    }
  }
  return [];
}

// ── Validate a single content block ────────────────────────────────────────
// Returns true if the block has the required fields for its type.

export function validateBlogContentBlock(block: BlogContent): boolean {
  if (!block || typeof block !== 'object') return false;
  if (!('type' in block)) return false;

  const type = block.type;
  if (typeof type !== 'string') return false;

  // Check required fields per type
  if (type === 'text') return typeof (block as any).content === 'string';
  if (type === 'code') return typeof (block as any).code === 'string';
  if (type === 'image') return typeof (block as any).url === 'string';
  if (type === 'heading') {
    const b = block as any;
    return typeof b.content === 'string' && [1, 2, 3].includes(b.level);
  }
  if (type === 'list') return Array.isArray((block as any).items);
  if (type === 'quote') return typeof (block as any).content === 'string';
  if (type === 'divider') return true;

  // Unknown type: warn but don't fail
  console.warn(`Unknown blog content block type: ${type}`);
  return true;
}

// ── Render a single content block ──────────────────────────────────────────

function renderBlock(block: BlogContent, index: number): React.ReactNode {
  if (!validateBlogContentBlock(block)) {
    console.warn('Invalid blog content block, skipping:', block);
    return null;
  }

  const type = block.type;
  if (typeof type !== 'string') return null;

  switch (type) {
    case 'text':
      return (
        <p key={index} className="mb-4 text-base leading-relaxed">
          {(block as any).content}
        </p>
      );

    case 'code':
      return (
        <div key={index} className="mb-4 rounded-lg overflow-hidden">
          <CodeBlock
            text={(block as any).code}
            language={(block as any).language || 'javascript'}
            showLineNumbers={true}
            theme={dracula}
          />
        </div>
      );

    case 'image':
      return (
        <figure key={index} className="mb-4">
          <img
            src={(block as any).url}
            alt={(block as any).alt || ''}
            className="w-full rounded-lg"
            loading="lazy"
          />
          {(block as any).caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {(block as any).caption}
            </figcaption>
          )}
        </figure>
      );

    case 'heading':
      const b = block as any;
      const HeadingTag = `h${b.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={index} className="font-bold mt-6 mb-3">
          {b.content}
        </HeadingTag>
      );

    case 'list':
      const listBlock = block as any;
      const ListTag = listBlock.ordered ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={cn('mb-4 pl-6', listBlock.ordered ? 'list-decimal' : 'list-disc')}>
          {listBlock.items.map((item: string, i: number) => (
            <li key={i} className="mb-1">{item}</li>
          ))}
        </ListTag>
      );

    case 'quote':
      const quoteBlock = block as any;
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {quoteBlock.content}
          {quoteBlock.attribution && (
            <cite className="block text-sm mt-2 not-italic">— {quoteBlock.attribution}</cite>
          )}
        </blockquote>
      );

    case 'divider':
      return <hr key={index} className="my-6 border-t border-border" />;

    default:
      console.warn(`Unknown blog content block type: ${type}, skipping`);
      return null;
  }
}

// ── BlogContentRenderer component ──────────────────────────────────────────
// Renders an array of BlogContent blocks to React nodes.
// Used in both read view (BlogPostPage) and edit preview (BlogEditor).

interface BlogContentRendererProps {
  content: BlogContent[] | string | null | undefined;
  className?: string;
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  content,
  className = '',
}) => {
  const blocks = parseBlogContent(content);

  if (blocks.length === 0) {
    return (
      <div className={cn('text-muted-foreground italic', className)}>
        No content to display.
      </div>
    );
  }

  return (
    <div className={cn('prose prose-lg dark:prose-invert max-w-none', className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

// ── Convenience function for non-component usage ────────────────────────────
// Returns ReactNode directly (for use inside other components' JSX).

export function renderBlogContent(content: BlogContent[] | string | null | undefined): React.ReactNode {
  return <BlogContentRenderer content={content} />;
}
