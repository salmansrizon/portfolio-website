import { useState } from 'react';
import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineMarkdown, BlockMarkdown } from './InlineMarkdown';

interface RoadmapTreeViewProps {
  nodes: RoadmapNode[];
}

const SubTopicBox = ({ node }: { node: RoadmapNode }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = node.children.length > 0 || node.content.length > 0;
  const contentMd = node.content.join('\n');

  return (
    <div className="w-full">
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border-2 border-accent/60',
          'bg-card hover:bg-accent/15 text-foreground',
          'font-medium text-[11px] sm:text-sm shadow-sm hover:shadow-md transition-all',
          'flex items-center justify-between gap-1.5',
          hasDetails && 'cursor-pointer',
        )}
      >
        <span className="break-words leading-tight"><InlineMarkdown>{node.title}</InlineMarkdown></span>
        {hasDetails && (
          <ChevronDown className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 transition-transform', expanded && 'rotate-180')} />
        )}
      </button>

      {expanded && hasDetails && (
        <div className="mt-1.5 px-2.5 py-2 sm:px-3 rounded-md bg-white dark:bg-card border border-border space-y-1.5">
          {contentMd && (
            <BlockMarkdown className="text-[11px] sm:text-sm text-foreground/90">{contentMd}</BlockMarkdown>
          )}
          {node.children.map((child) => {
            const childMd = child.content.join('\n');
            return (
              <div key={child.id} className="pl-1.5">
                <div className="text-[11px] sm:text-sm font-semibold text-foreground/90 mt-1.5 mb-0.5">
                  <InlineMarkdown>{child.title}</InlineMarkdown>
                </div>
                {childMd && (
                  <BlockMarkdown className="pl-2 text-[10.5px] sm:text-xs text-muted-foreground">{childMd}</BlockMarkdown>
                )}
                {child.children.map((g) => {
                  const gMd = g.content.join('\n');
                  return (
                    <div key={g.id} className="pl-2 mt-1">
                      <div className="text-[11px] sm:text-xs font-medium text-foreground/80">
                        <InlineMarkdown>{g.title}</InlineMarkdown>
                      </div>
                      {gMd && (
                        <BlockMarkdown className="pl-2 text-[10.5px] sm:text-xs text-muted-foreground">{gMd}</BlockMarkdown>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MainSection = ({ node, index }: { node: RoadmapNode; index: number }) => {
  const subTopics = node.children;
  const hasSubs = subTopics.length > 0;
  const contentMd = node.content.join('\n');

  return (
    <div className="relative w-full py-3 sm:py-6">
      {/* Central section box */}
      <div className="relative z-10 flex justify-center">
        <div
          className={cn(
            'px-3 py-2 sm:px-6 sm:py-3 rounded-md border-2 border-primary',
            'bg-primary text-primary-foreground',
            'font-bold text-xs sm:text-base shadow-md text-center min-w-[140px] sm:min-w-[220px] max-w-[260px] sm:max-w-[280px]',
          )}
        >
          <InlineMarkdown>{node.title}</InlineMarkdown>
        </div>
      </div>

      {/* Sub-topics: stacked on mobile, alternating on desktop */}
      {hasSubs && (
        <div className="mt-3 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-2 sm:gap-y-3 relative z-10">
          {subTopics.map((sub, i) => {
            const isLeft = (index + i) % 2 === 0;
            return (
              <div
                key={sub.id}
                className={cn(
                  'relative',
                  'sm:' + (isLeft ? 'col-start-1' : 'col-start-2'),
                  isLeft ? 'sm:col-start-1 sm:justify-self-end sm:pr-6' : 'sm:col-start-2 sm:justify-self-start sm:pl-6',
                )}
                style={{ width: '100%' }}
              >
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

      {/* Direct content under section */}
      {contentMd && (
        <div className="mt-3 max-w-md mx-auto px-3 py-2 rounded-md bg-white dark:bg-card border border-border">
          <BlockMarkdown className="text-[11px] sm:text-sm text-muted-foreground">{contentMd}</BlockMarkdown>
        </div>
      )}
    </div>
  );
};

const RoadmapTreeView = ({ nodes }: RoadmapTreeViewProps) => {
  const sections = nodes.length === 1 && nodes[0].children.length > 0 ? nodes[0].children : nodes;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-2 sm:py-4">
      {/* Spine — only on desktop, stack flows linearly on mobile */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary/50 hidden sm:block" aria-hidden />

      <div className="relative space-y-1 sm:space-y-2">
        {sections.map((section, i) => (
          <MainSection key={section.id} node={section} index={i} />
        ))}
      </div>
    </div>
  );
};

export default RoadmapTreeView;
