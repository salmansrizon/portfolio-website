export interface RoadmapNode {
  id: string;
  title: string;
  level: number; // 1=h1, 2=h2, 3=h3, etc.
  content: string[]; // list items / paragraphs under this heading
  children: RoadmapNode[];
}

/**
 * Parses markdown into a tree of RoadmapNodes based on headings.
 * H1 = root, H2 = main sections, H3 = sub-topics, etc.
 * List items under a heading become its content.
 */
export function parseRoadmapMarkdown(md: string): RoadmapNode[] {
  const lines = md.split('\n');
  const root: RoadmapNode = { id: 'root', title: 'Root', level: 0, content: [], children: [] };
  const stack: RoadmapNode[] = [root];

  let nodeCounter = 0;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].replace(/^\d+\.\s*/, '').trim();
      nodeCounter++;
      const node: RoadmapNode = {
        id: `node-${nodeCounter}`,
        title,
        level,
        content: [],
        children: [],
      };

      // Pop stack until we find a parent with lower level
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
      continue;
    }

    // List item or content line
    const listMatch = line.match(/^[-*+]\s+(.+)/);
    if (listMatch && stack.length > 1) {
      stack[stack.length - 1].content.push(listMatch[1].trim());
      continue;
    }

    // Non-empty non-heading line
    const trimmed = line.trim();
    if (trimmed && stack.length > 1) {
      stack[stack.length - 1].content.push(trimmed);
    }
  }

  return root.children;
}
