import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InlineMarkdownProps {
  children: string;
  className?: string;
}

/**
 * Renders a single line of markdown inline (no <p> wrapping).
 * Supports bold, italic, code, links — the things that show up in roadmap bullets.
 */
const InlineMarkdown = ({ children, className }: InlineMarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <span className={className}>{children}</span>,
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          {children}
        </a>
      ),
      code: ({ children }) => (
        <code className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[0.85em]">
          {children}
        </code>
      ),
      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    }}
  >
    {children}
  </ReactMarkdown>
);

export default InlineMarkdown;
