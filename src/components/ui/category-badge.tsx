import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CategoryBadge — colors a course/blog category chip by the shared series
 * palette, so the same hue means the same category across site cards and
 * admin charts. Identity is carried by a dot + label, never color alone.
 */
type SeriesTone = "web" | "data" | "career" | "webinar";
type Tone = SeriesTone | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  web: "bg-series-web/10 text-series-web",
  data: "bg-series-data/10 text-series-data",
  career: "bg-series-career/10 text-series-career",
  webinar: "bg-series-webinar/10 text-series-webinar",
  neutral: "bg-panel-2 text-muted-foreground border border-border",
};

const DOT_CLASS: Record<Tone, string> = {
  web: "bg-series-web",
  data: "bg-series-data",
  career: "bg-series-career",
  webinar: "bg-series-webinar",
  neutral: "bg-muted-foreground",
};

// Keyword → tone. First match wins; keep the most specific words first.
const KEYWORD_TONE: Array<[string, SeriesTone]> = [
  ["web", "web"],
  ["frontend", "web"],
  ["full-stack", "web"],
  ["fullstack", "web"],
  ["development", "web"],
  ["data", "data"],
  ["analytic", "data"],
  ["sql", "data"],
  ["career", "career"],
  ["interview", "career"],
  ["resume", "career"],
  ["webinar", "webinar"],
];

function resolveTone(category?: string, explicit?: SeriesTone): Tone {
  if (explicit) return explicit;
  if (!category) return "neutral";
  const c = category.toLowerCase();
  for (const [kw, tone] of KEYWORD_TONE) {
    if (c.includes(kw)) return tone;
  }
  return "neutral";
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** category name/slug; used to pick the tone and as the label when no children */
  category?: string;
  /** override the auto-resolved tone */
  tone?: SeriesTone;
  /** show the leading identity dot (default true) */
  dot?: boolean;
}

export function CategoryBadge({ category, tone, dot = true, className, children, ...props }: CategoryBadgeProps) {
  const resolved = resolveTone(category, tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLASS[resolved],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[resolved])} />}
      {children ?? category}
    </span>
  );
}
