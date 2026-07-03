import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Circle } from 'lucide-react';
import { InlineMarkdown, BlockMarkdown } from './InlineMarkdown';

interface RoadmapAccordionViewProps {
  nodes: RoadmapNode[];
}

const AccordionNode = ({ node, depth = 0 }: { node: RoadmapNode; depth?: number }) => {
  const hasExpandable = node.children.length > 0 || node.content.length > 0;
  const contentMd = node.content.join('\n');

  if (!hasExpandable) {
    return (
      <div className="flex items-start gap-2 py-1.5 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground">
        <Circle className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 fill-current mt-1.5" />
        <span className="break-words"><InlineMarkdown>{node.title}</InlineMarkdown></span>
      </div>
    );
  }

  return (
    <AccordionItem value={node.id} className="border-none">
      <AccordionTrigger className={`px-3 sm:px-4 py-2 sm:py-3 hover:no-underline hover:bg-muted/50 rounded-lg text-left ${
        depth === 0 ? 'text-sm sm:text-base font-bold' : depth === 1 ? 'text-xs sm:text-sm font-semibold' : 'text-xs sm:text-sm font-medium'
      }`}>
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0 mt-1.5 ${
            depth === 0 ? 'bg-primary' : depth === 1 ? 'bg-series-web' : 'bg-series-data'
          }`} />
          <span className="break-words min-w-0"><InlineMarkdown>{node.title}</InlineMarkdown></span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4 sm:pl-6">
        {contentMd && (
          <div className="mb-2 px-2 sm:px-3 py-2 rounded-md bg-white dark:bg-card border border-border">
            <BlockMarkdown className="text-xs sm:text-sm text-muted-foreground">{contentMd}</BlockMarkdown>
          </div>
        )}
        {node.children.length > 0 && (
          <Accordion type="multiple" className="space-y-1">
            {node.children.map((child) => (
              <AccordionNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const RoadmapAccordionView = ({ nodes }: RoadmapAccordionViewProps) => {
  return (
    <Accordion type="multiple" className="space-y-1.5 sm:space-y-2">
      {nodes.map((node) => (
        <AccordionNode key={node.id} node={node} depth={0} />
      ))}
    </Accordion>
  );
};

export default RoadmapAccordionView;
