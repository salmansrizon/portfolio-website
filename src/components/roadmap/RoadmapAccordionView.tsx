import { RoadmapNode } from '@/utils/parseRoadmapMarkdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Circle } from 'lucide-react';

interface RoadmapAccordionViewProps {
  nodes: RoadmapNode[];
}

const AccordionNode = ({ node, depth = 0 }: { node: RoadmapNode; depth?: number }) => {
  const hasExpandable = node.children.length > 0 || node.content.length > 0;

  if (!hasExpandable) {
    return (
      <div className="flex items-center gap-2 py-2 px-4 text-sm text-muted-foreground">
        <Circle className="h-2.5 w-2.5 shrink-0 fill-current" />
        <span>{node.title}</span>
      </div>
    );
  }

  return (
    <AccordionItem value={node.id} className="border-none">
      <AccordionTrigger className={`px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-lg ${
        depth === 0 ? 'text-base font-bold' : depth === 1 ? 'text-sm font-semibold' : 'text-sm font-medium'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full shrink-0 ${
            depth === 0 ? 'bg-primary' : depth === 1 ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
          {node.title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-6">
        {node.content.length > 0 && (
          <ul className="space-y-1 mb-2">
            {node.content.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground py-0.5">
                <Circle className="h-2 w-2 shrink-0 mt-1.5 text-muted-foreground/50" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
    <Accordion type="multiple" className="space-y-2">
      {nodes.map((node) => (
        <AccordionNode key={node.id} node={node} depth={0} />
      ))}
    </Accordion>
  );
};

export default RoadmapAccordionView;
