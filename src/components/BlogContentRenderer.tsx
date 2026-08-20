import React from 'react';
import { CodeBlock, dracula } from 'react-code-blocks';
import { cn } from '@/lib/utils';
import { blogContentSchema, type BlogContent } from '@/types/blog';

// The block union and its schema live in @/types/blog — this module renders
// them and owns the parse boundary. Re-exported because most consumers import
// the type from here.
export type { BlogContent };

// ── Parse raw content from Supabase ────────────────────────────────────────
// Supabase sometimes returns content as a JSON string, sometimes as an array.
// This normalizes it to BlogContent[].

export function parseBlogContent(raw: string | BlogContent[] | null | undefined): BlogContent[] {
  if (!raw) return [];

  let blocks: unknown = raw;
  if (typeof raw === 'string') {
    try {
      blocks = JSON.parse(raw);
    } catch {
      console.warn('Failed to parse blog content as JSON, returning empty array');
      return [];
    }
  }
  if (!Array.isArray(blocks)) return [];

  // Validate here, once. Anything that is not a known block is dropped with a
  // warning — which is what the renderer already did, one layer later and
  // without telling the type system.
  return blocks.flatMap((block) => {
    const parsed = blogContentSchema.safeParse(block);
    if (!parsed.success) {
      console.warn('Dropping invalid blog content block:', block);
      return [];
    }
    return [parsed.data];
  });
}

// ── Validate a single content block ────────────────────────────────────────

export function validateBlogContentBlock(block: unknown): boolean {
  return blogContentSchema.safeParse(block).success;
}

// ── Render a single content block ──────────────────────────────────────────

function renderBlock(block: BlogContent, index: number): React.ReactNode {
  switch (block.type) {
    case 'text':
      return (
        <p key={index} className="mb-4 text-base leading-relaxed">
          {block.content}
        </p>
      );

    case 'code':
      return (
        <div key={index} className="mb-4 rounded-lg overflow-hidden">
          <CodeBlock
            text={block.code}
            language={block.language || 'javascript'}
            showLineNumbers={true}
            theme={dracula}
          />
          {block.caption && (
            <p className="text-center text-sm text-muted-foreground mt-2">{block.caption}</p>
          )}
        </div>
      );

    case 'image':
      return (
        <figure key={index} className="mb-4">
          <img
            src={block.url}
            alt={block.alt || ''}
            className="w-full rounded-lg"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'heading':
      const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={index} className="font-bold mt-6 mb-3">
          {block.content}
        </HeadingTag>
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={cn('mb-4 pl-6', block.ordered ? 'list-decimal' : 'list-disc')}>
          {block.items.map((item, i) => (
            <li key={i} className="mb-1">{item}</li>
          ))}
        </ListTag>
      );

    case 'quote':
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {block.content}
          {block.attribution && (
            <cite className="block text-sm mt-2 not-italic">— {block.attribution}</cite>
          )}
        </blockquote>
      );

    case 'divider':
      return <hr key={index} className="my-6 border-t border-border" />;

    default:
      // Unreachable: parseBlogContent drops anything not in the union.
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
