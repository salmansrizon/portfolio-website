import { useState } from 'react';
import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapTreeViewProps {
  nodes: RoadmapNode[];
}

const TreeNode = ({ node, depth = 0 }: { node: RoadmapNode; depth?: number }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0 || node.content.length > 0;

  // Color palette for different depths
  const depthColors = [
    'border-primary bg-primary/5 hover:bg-primary/10',
    'border-blue-500 bg-blue-500/5 hover:bg-blue-500/10',
    'border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10',
    'border-amber-500 bg-amber-500/5 hover:bg-amber-500/10',
    'border-purple-500 bg-purple-500/5 hover:bg-purple-500/10',
  ];

  const dotColors = [
    'bg-primary',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
  ];

  const colorIdx = depth % depthColors.length;

  return (
    <div className="relative">
      {/* Connector line from parent */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" style={{ left: '-12px' }} />
      )}

      <div className="relative">
        {/* Horizontal connector */}
        {depth > 0 && (
          <div className="absolute top-4 sm:top-5 w-3 sm:w-4 h-px bg-border" style={{ left: '-12px' }} />
        )}

        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={cn(
            'flex items-start gap-1.5 sm:gap-2 w-full text-left p-2 sm:p-3 rounded-lg border transition-all duration-200',
            depthColors[colorIdx],
            hasChildren && 'cursor-pointer',
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
              )
            ) : (
              <div className={cn('h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 mt-1', dotColors[colorIdx])} />
            )}
            <span className={cn(
              'font-medium break-words',
              depth === 0 && 'text-sm sm:text-lg font-bold',
              depth === 1 && 'text-xs sm:text-base font-semibold',
              depth >= 2 && 'text-xs sm:text-sm',
            )}>
              {node.title}
            </span>
            {node.children.length > 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto shrink-0">
                {node.children.length}
              </span>
            )}
          </div>
        </button>

        {expanded && (
          <div className="ml-3 sm:ml-6 mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2 relative">
            {/* Vertical connector line */}
            {(node.children.length > 0 || node.content.length > 0) && (
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" style={{ left: '-12px' }} />
            )}

            {node.content.length > 0 && (
              <div className="pl-1 sm:pl-2 space-y-0.5 sm:space-y-1">
                {node.content.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground py-0.5">
                    <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 mt-0.5 text-muted-foreground/50" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RoadmapTreeView = ({ nodes }: RoadmapTreeViewProps) => {
  return (
    <div className="space-y-2 sm:space-y-4">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
};

export default RoadmapTreeView;
