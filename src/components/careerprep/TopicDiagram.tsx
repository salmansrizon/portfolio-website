import { ArrowRight } from 'lucide-react';

// A small visual for a sub-topic card, drawn from a one-line spec rather than an
// image file:
//
//   flow: Ingest > Chunk > Embed > Index      — a pipeline, left to right
//   compare: Batch | Streaming                — two columns, side by side
//   stack: Raw / Staged / Marts               — layers, bottom to top
//
// Text rather than SVG assets because a diagram in the database stays
// searchable, themable and translatable, and fixing a typo does not require a
// design tool. Anything more complex than these three shapes belongs in prose —
// a diagram nobody can read at a glance is decoration.

interface Props {
  spec: string;
}

const parse = (spec: string) => {
  const [rawKind, ...rest] = spec.split(':');
  const kind = rawKind.trim().toLowerCase();
  const body = rest.join(':').trim();
  if (kind === 'flow') return { kind, parts: body.split('>').map((s) => s.trim()).filter(Boolean) };
  if (kind === 'compare') return { kind, parts: body.split('|').map((s) => s.trim()).filter(Boolean) };
  if (kind === 'stack') return { kind, parts: body.split('/').map((s) => s.trim()).filter(Boolean) };
  return null;
};

const TopicDiagram = ({ spec }: Props) => {
  const parsed = parse(spec);
  // An unreadable spec renders nothing rather than a broken box: a malformed
  // diagram should cost the reader nothing.
  if (!parsed || parsed.parts.length === 0) return null;

  if (parsed.kind === 'flow') {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {parsed.parts.map((part, i) => (
          <div key={part + i} className="flex items-center gap-1.5">
            <span className="rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold">
              {part}
            </span>
            {i < parsed.parts.length - 1 && (
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (parsed.kind === 'compare') {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {parsed.parts.map((part, i) => {
          const [head, ...lines] = part.split(';').map((s) => s.trim());
          return (
            <div key={part + i} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-primary">{head}</p>
              {lines.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {lines.map((line) => (
                    <li key={line} className="text-[11px] text-muted-foreground">· {line}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // stack — drawn top-down in the order written, so "Raw / Staged / Marts" reads
  // the way people say it.
  return (
    <div className="mt-3 space-y-1">
      {parsed.parts.map((part, i) => (
        <div
          key={part + i}
          className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-bold"
          style={{ marginLeft: `${i * 12}px` }}
        >
          {part}
        </div>
      ))}
    </div>
  );
};

export default TopicDiagram;
