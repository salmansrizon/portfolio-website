import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Inline markdown — wraps in <span>, used for titles & single-line bullets.
 */
export const InlineMarkdown = ({ children, className }: MarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <span className={className}>{children}</span>,
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
          {children}
        </a>
      ),
      code: ({ children }) => (
        <code className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[0.85em]">{children}</code>
      ),
      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    }}
  >
    {children}
  </ReactMarkdown>
);

/**
 * Block markdown — full markdown support including tables, lists, paragraphs.
 * Use for content blocks where tables/multi-line formatting may appear.
 */
export const BlockMarkdown = ({ children, className }: MarkdownProps) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="my-1 break-words">{children}</p>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[0.85em]">{children}</code>
        ),
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 my-1">{children}</ol>,
        li: ({ children }) => <li className="break-words">{children}</li>,
        table: ({ children }) => (
          <div className="my-2 -mx-1 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[11px] sm:text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/70">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
        th: ({ children }) => <th className="px-2 py-1.5 text-left font-semibold text-foreground whitespace-nowrap">{children}</th>,
        td: ({ children }) => <td className="px-2 py-1.5 align-top text-muted-foreground">{children}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export default InlineMarkdown;
