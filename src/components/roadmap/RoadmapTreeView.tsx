import { useState } from 'react';
import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapTreeViewProps {
  nodes: RoadmapNode[];
}

/**
 * roadmap.sh-inspired layout:
 * - Central vertical spine
 * - Main sections (depth 0) appear as yellow boxes ON the spine
 * - Sub-topics (depth 1) appear as orange boxes branching to alternating sides
 * - Deeper items show as bullet lists inside the sub-topic box when expanded
 */

const SubTopicBox = ({ node }: { node: RoadmapNode }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = node.children.length > 0 || node.content.length > 0;

  return (
    <div className="w-full">
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'w-full text-left px-3 py-2 rounded-md border-2 border-accent/60',
          'bg-accent/15 hover:bg-accent/25 text-foreground',
          'font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all',
          'flex items-center justify-between gap-2',
          hasDetails && 'cursor-pointer',
        )}
      >
        <span className="break-words">{node.title}</span>
        {hasDetails && (
          <ChevronDown
            className={cn('h-3.5 w-3.5 shrink-0 transition-transform', expanded && 'rotate-180')}
          />
        )}
      </button>

      {expanded && hasDetails && (
        <div className="mt-1.5 px-3 py-2 rounded-md bg-muted/60 border border-border space-y-1">
          {node.content.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span className="break-words">{item}</span>
            </div>
          ))}
          {node.children.map((child) => (
            <div key={child.id} className="pl-2">
              <div className="text-xs sm:text-sm font-semibold text-foreground/90 mt-1.5 mb-1">
                {child.title}
              </div>
              {child.content.length > 0 && (
                <ul className="space-y-0.5 pl-3">
                  {child.content.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="break-words">{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              {child.children.map((g) => (
                <div key={g.id} className="pl-3 mt-1">
                  <div className="text-xs font-medium text-foreground/80">{g.title}</div>
                  {g.content.length > 0 && (
                    <ul className="space-y-0.5 pl-3">
                      {g.content.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="break-words">{c}</span>
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

const MainSection = ({ node, index }: { node: RoadmapNode; index: number }) => {
  const subTopics = node.children;
  const hasSubs = subTopics.length > 0;

  return (
    <div className="relative w-full py-4 sm:py-6">
      {/* Central yellow section box */}
      <div className="relative z-10 flex justify-center">
        <div
          className={cn(
            'px-4 py-2.5 sm:px-6 sm:py-3 rounded-md border-2 border-foreground/80',
            'bg-[hsl(55_95%_70%)] dark:bg-[hsl(50_85%_55%)] text-foreground',
            'font-bold text-sm sm:text-base shadow-md text-center min-w-[180px] sm:min-w-[220px] max-w-[280px]',
          )}
        >
          {node.title}
        </div>
      </div>

      {/* Sub-topics branching to alternating sides */}
      {hasSubs && (
        <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-3 relative z-10">
          {subTopics.map((sub, i) => {
            // Alternate: even index → left, odd → right
            const isLeft = (index + i) % 2 === 0;
            return (
              <div
                key={sub.id}
                className={cn(
                  'relative',
                  isLeft ? 'col-start-1 justify-self-end pr-2 sm:pr-6' : 'col-start-2 justify-self-start pl-2 sm:pl-6',
                )}
                style={{ maxWidth: '100%', width: '100%' }}
              >
                {/* Connector dotted line to spine */}
                <div
                  className={cn(
                    'absolute top-4 hidden sm:block border-t-2 border-dotted border-primary/60',
                    isLeft ? 'right-0 left-auto w-6' : 'left-0 right-auto w-6',
                  )}
                />
                <SubTopicBox node={sub} />
              </div>
            );
          })}
        </div>
      )}

      {/* Render any direct content under the section */}
      {node.content.length > 0 && (
        <div className="mt-3 max-w-md mx-auto px-3 py-2 rounded-md bg-muted/40 border border-border">
          <ul className="space-y-1">
            {node.content.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const RoadmapTreeView = ({ nodes }: RoadmapTreeViewProps) => {
  // Flatten: if a single root H1 wraps everything, use its children as main sections
  const sections =
    nodes.length === 1 && nodes[0].children.length > 0 ? nodes[0].children : nodes;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4">
      {/* Central vertical spine */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary/50"
        aria-hidden
      />

      <div className="relative space-y-2">
        {sections.map((section, i) => (
          <MainSection key={section.id} node={section} index={i} />
        ))}
      </div>
    </div>
  );
};

export default RoadmapTreeView;
