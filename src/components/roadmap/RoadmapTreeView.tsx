import { useState } from 'react';
import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import { ChevronDown, ArrowUpRight, StickyNote, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapTreeViewProps {
  nodes: RoadmapNode[];
}

/**
 * Professional vertical timeline layout:
 * - Single left-aligned spine
 * - Each main section = a "milestone" with a circular icon marker
 * - Sub-topics render as timeline items with status pills
 * - Expandable note cards reveal nested details
 */

const SubTopic = ({ node, isLast }: { node: RoadmapNode; isLast: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const hasNote = node.content.length > 0 || node.children.length > 0;

  return (
    <div className="relative pl-10 sm:pl-12 pb-5 last:pb-0">
      {/* Spine continuation */}
      {!isLast && (
        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-px bg-border" aria-hidden />
      )}

      {/* Marker icon */}
      <div className="absolute left-0 top-0.5 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground shadow-sm ring-4 ring-background">
        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </div>

      {/* Header row */}
      <div className="flex items-start flex-wrap gap-x-2 gap-y-1">
        <h4 className="font-semibold text-sm sm:text-[15px] text-foreground leading-6">
          {node.title}
        </h4>
        {node.children.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-muted/60 text-xs font-medium text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {node.children.length} topics
          </span>
        )}
      </div>

      {/* Subtitle / meta line */}
      {node.content.length > 0 && !expanded && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
          {node.content[0]}
        </p>
      )}

      {/* Expand control */}
      {hasNote && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? 'Hide details' : 'View details'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}

      {/* Expanded note card */}
      {expanded && hasNote && (
        <div className="mt-3 rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          {node.content.length > 0 && (
            <div className="px-4 py-3 border-b border-border/60 last:border-b-0">
              <ul className="space-y-1.5">
                {node.content.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/85 leading-relaxed">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {node.children.map((child) => (
            <div key={child.id} className="px-4 py-3 border-b border-border/60 last:border-b-0">
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                {child.title}
              </div>
              {child.content.length > 0 && (
                <ul className="space-y-1 pl-1">
                  {child.content.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              {child.children.map((g) => (
                <div key={g.id} className="mt-2 pl-2 border-l-2 border-border">
                  <div className="text-xs font-medium text-foreground/90">{g.title}</div>
                  {g.content.length > 0 && (
                    <ul className="space-y-0.5 pl-2 mt-0.5">
                      {g.content.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Milestone = ({ node, isLast }: { node: RoadmapNode; isLast: boolean }) => {
  const subs = node.children;

  return (
    <div className="relative">
      {/* Day/section heading */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
          {node.title}
        </h3>
      </div>

      {/* Direct content (no sub-topics case) */}
      {node.content.length > 0 && subs.length === 0 && (
        <div className="pl-10 sm:pl-12 pb-5 relative">
          {!isLast && (
            <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-px bg-border" aria-hidden />
          )}
          <div className="absolute left-0 top-0.5 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-accent text-accent-foreground shadow-sm ring-4 ring-background">
            <StickyNote className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </div>
          <ul className="space-y-1.5">
            {node.content.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sub-topics */}
      <div>
        {subs.map((sub, i) => (
          <SubTopic
            key={sub.id}
            node={sub}
            isLast={isLast && i === subs.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const RoadmapTreeView = ({ nodes }: RoadmapTreeViewProps) => {
  // If a single H1 root wraps everything, use its children as milestones
  const milestones =
    nodes.length === 1 && nodes[0].children.length > 0 ? nodes[0].children : nodes;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="space-y-6 sm:space-y-8">
        {milestones.map((m, i) => (
          <Milestone key={m.id} node={m} isLast={i === milestones.length - 1} />
        ))}
      </div>
    </div>
  );
};

export default RoadmapTreeView;
