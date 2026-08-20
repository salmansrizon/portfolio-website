import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TopicSection } from '@/hooks/useTopics';
import TopicDiagram from './TopicDiagram';

// The second layer of a Topic. The Topic card says what the thing is; these say
// how it actually works, what decision you face, and how it fails.
//
// The first card opens by default and the rest are collapsed: a wall of open
// text reads as homework, and a wall of closed accordions reads as empty.

interface Props {
  sections: TopicSection[];
}

const TopicSections = ({ sections }: Props) => {
  const [open, setOpen] = useState<string | null>(sections[0]?.id ?? null);

  if (sections.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
        In depth ({sections.length})
      </h2>

      <div className="space-y-1.5">
        {sections.map((section, i) => {
          const isOpen = open === section.id;
          return (
            <div key={section.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-black text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold">{section.title}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">
                    {section.body}
                  </p>
                  {section.diagram && <TopicDiagram spec={section.diagram} />}
                  {section.takeaway && (
                    <p className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-[12px] font-semibold">
                      {section.takeaway}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopicSections;
