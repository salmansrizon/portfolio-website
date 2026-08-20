import { useNavigate } from 'react-router-dom';
import { useTopicProgress } from '@/hooks/useTopics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, GraduationCap, Lock, Map, Flag } from 'lucide-react';
import type { JourneyStage } from '@/hooks/useJourney';

/**
 * The plan as a timeline rather than a list.
 *
 * Week ranges are cumulative from the admin-set durations, so a learner sees
 * where each stage sits in the whole plan. The current stage is derived from
 * elapsed weeks — elapsed progress, never lateness: nothing here says "overdue",
 * because guilt mechanics are what the harm evidence implicates.
 */

interface Props {
  plan: JourneyStage[];
  /** 1-based elapsed week in the Journey. */
  currentWeek: number;
  /** Journey slug, for the assessment link on the finish-line node. */
  journeySlug?: string;
}

const JourneyTimeline = ({ plan, currentWeek, journeySlug }: Props) => {
  const navigate = useNavigate();
  const { passed: passedTopics } = useTopicProgress();

  // Cumulative week ranges: stage 1 is weeks 1-8, stage 2 is 9-12, and so on.
  let cursor = 0;
  const stages = plan.map((r) => {
    const start = cursor + 1;
    const end = cursor + (r.duration_weeks ?? 0);
    cursor = end;
    return { ...r, start, end };
  });

  const totalWeeks = cursor;

  return (
    <ol className="relative space-y-1">
      {stages.map((s, i) => {
        const done = currentWeek > s.end;
        const current = currentWeek >= s.start && currentWeek <= s.end;
        // "Coming soon" is now about Topics, not about whether a Roadmap
        // document exists — the Roadmap is a reference, not the material.
        const hasTopics = s.topics.length > 0;
        const roadmapPublished = s.roadmap?.status === 'published';
        const last = i === stages.length - 1;

        return (
          <li key={s.id} className="relative flex gap-4 pb-4">
            {/* Connector — stops at the last node so the line does not dangle. */}
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5 ${
                  done ? 'bg-success/50' : 'bg-border'
                }`}
              />
            )}

            <span
              className={`relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
                done
                  ? 'border-success bg-success-soft text-success-strong'
                  : current
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : !s.is_assessable ? (
                <GraduationCap className="h-4 w-4" />
              ) : hasTopics ? (
                <span className="text-xs font-black">{i + 1}</span>
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`font-semibold ${current ? 'text-foreground' : ''}`}>
                  {s.title}
                </p>
                {current && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">You are here</Badge>
                )}
                {!s.is_assessable && (
                  <Badge variant="outline" className="text-[10px]">not assessable here — Course</Badge>
                )}
                {!hasTopics && s.is_assessable && (
                  <Badge variant="outline" className="text-[10px]">coming soon</Badge>
                )}
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.start === s.end ? `Week ${s.start}` : `Weeks ${s.start}–${s.end}`}
                {' · '}
                {s.duration_weeks}w
              </p>

              {/* The interactive material comes first; the written map is the
                  optional deeper read underneath it. */}
              {hasTopics && (
                <ul className="mt-2 space-y-1">
                  {s.topics.map((t) => {
                    const done = passedTopics.has(t.id);
                    return (
                      <li key={t.id}>
                        <button
                          onClick={() => navigate(`/career-prep/topic/${t.slug}`)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60"
                        >
                          {done
                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                            : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                          <span className={`leading-snug ${done ? 'text-muted-foreground line-through' : ''}`}>{t.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {roadmapPublished && s.roadmap && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 gap-1.5 rounded-full px-3 text-[11px]"
                  onClick={() => navigate(`/roadmaps/${s.roadmap!.slug}`)}
                >
                  <Map className="h-3 w-3" /> View full roadmap
                </Button>
              )}
            </div>
          </li>
        );
      })}

      {/* The finish line, so the plan reads as having an end rather than trailing off. */}
      <li className="relative flex gap-4">
        <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground">
          <Flag className="h-3.5 w-3.5" />
        </span>
        <div className="pt-1">
          <p className="text-sm font-semibold">Final assessment &amp; certificate</p>
          <p className="text-xs text-muted-foreground">
            {totalWeeks > 0 ? `Week ${totalWeeks}` : 'At the end'} · timed, covers the assessed portion
          </p>
          {journeySlug && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 gap-1.5 rounded-full px-3 text-[11px]"
              onClick={() => navigate(`/career-prep/assessment/${journeySlug}`)}
            >
              <Flag className="h-3 w-3" /> Take the assessment
            </Button>
          )}
        </div>
      </li>
    </ol>
  );
};

export default JourneyTimeline;
