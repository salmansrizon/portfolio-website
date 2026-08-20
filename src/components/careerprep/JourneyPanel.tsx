import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flame, Zap, Trophy, ChevronRight, Play, RotateCcw, CalendarDays, Library,
} from 'lucide-react';
import { useXPStats } from '@/hooks/useCareerPrep';
import {
  useJourneys, useActiveEnrolment, useJourneyPlan, useEnrol, journeyPosition,
} from '@/hooks/useJourney';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useJourneyQuestionPool, useJourneyDailyChallenge } from '@/hooks/useJourneyScope';
import { useNextUp } from '@/hooks/useNextUp';
import { useTopicProgress } from '@/hooks/useTopics';
import JourneyOffers from './JourneyOffers';
import { JourneyPanelSkeleton } from '@/components/ui/skeletons';
import JourneyTimeline from './JourneyTimeline';
import ClaimProfileCard from './ClaimProfileCard';

// Variant A — "Journey First". The plan leads the page, and the Library sits on
// its own route behind a card, so a learner picks structure or practice.
//
// The Journey card is skipped when nothing is published, so the page degrades to
// the Library card rather than showing an empty personalization shell (§6).

/** Only the fields this panel reads. The Repository returns every column as
 *  optional, so a structural type keeps the call site honest without casting. */
interface QuestionLike {
  id?: string;
  slug?: string;
  title?: string;
  industry?: string;
  difficulty?: string;
  parent_id?: string | null;
}

interface Props {
  /** Top-level questions, already loaded by the page. */
  questions: QuestionLike[];
  onOpenQuestion: (slug: string) => void;
}

const JourneyPanel = ({ questions, onOpenQuestion }: Props) => {
  const navigate = useNavigate();
  const { journeys, loading: journeysLoading } = useJourneys();
  const { enrolment } = useActiveEnrolment();
  const { plan } = useJourneyPlan(enrolment?.journey_id);
  const enrol = useEnrol();
  const stats = useXPStats();
  // Everything below is scoped to the enrolled Journey. A learner who picked AI
  // Engineering gets AI practice, an AI daily challenge and an AI queue — being
  // handed a window-functions drill reads as the product forgetting what they
  // chose.
  const { pool } = useJourneyQuestionPool(enrolment?.journey_id);
  const { daily: globalDaily } = useDailyChallenge();
  const { daily: journeyDaily } = useJourneyDailyChallenge(enrolment?.journey_id);
  const poolSlugs = new Set(pool.map((q) => q.slug));
  const { items: nextUp } = useNextUp(3, enrolment ? poolSlugs : undefined);

  // The global deck still serves anyone who has not chosen a plan yet.
  const daily = enrolment
    ? (journeyDaily ? { question: journeyDaily } : null)
    : globalDaily;
  const { passed: passedTopics } = useTopicProgress();

  // Topic progress, not XP progress: what the learner is asking is "how far
  // through the plan am I", and XP answers a different question.
  const planTopics = plan.flatMap((stage) => stage.topics);
  const doneCount = planTopics.filter((t) => passedTopics.has(t.id)).length;
  const nextTopic = planTopics.find((t) => !passedTopics.has(t.id)) ?? null;
  const planPct = planTopics.length ? Math.round((doneCount / planTopics.length) * 100) : 0;

  const journey = journeys.find((j) => j.id === enrolment?.journey_id);
  const [showSwitcher, setShowSwitcher] = useState(false);

  // The plan is the whole page here, so an empty frame while it loads reads as
  // a broken page. A skeleton of the same shape holds the space instead.
  if (journeysLoading) return <JourneyPanelSkeleton />;

  // No early return on "no Journeys": the Library card below is the other way
  // in, and it must survive an empty Journey list. Only the Journey/intake card
  // is conditional.
  return (
    <section className="container max-w-7xl mx-auto px-4 pb-4">
      {journeys.length === 0 ? null : journey ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Your Journey
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold">{journey.title}</h2>
                  {/* Switching is a real need — people change target roles — but it
                      must not compete with Continue, so it is a quiet link beside
                      the title rather than a button in the action row. */}
                  <button
                    onClick={() => setShowSwitcher((v) => !v)}
                    className="text-[11px] font-bold text-muted-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {showSwitcher ? 'Close' : 'View other journeys'}
                  </button>
                </div>
                {(() => {
                  const { week, totalWeeks } = journeyPosition(plan, enrolment?.started_at);
                  return (
                    <p className="text-sm text-muted-foreground">
                      {totalWeeks > 0 ? `Week ${week} of ${totalWeeks}` : 'Just started'}
                    </p>
                  );
                })()}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Flame className="h-4 w-4 text-warning" />{stats.streak}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Zap className="h-4 w-4 text-primary" />{stats.xp.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Trophy className="h-4 w-4 text-success" />
                  {stats.levelName ?? `Level ${stats.level}`}
                </span>
              </div>
            </div>
            {planTopics.length > 0 && (
              <>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold">
                    {doneCount} of {planTopics.length} topics
                  </span>
                  <span className="text-muted-foreground">{planPct}%</span>
                </div>
                <Progress value={planPct} className="h-2" />

                {/* One button, always pointing at the next unfinished Topic.
                    A plan the learner has to re-find their place in is a plan
                    that quietly stops being followed. */}
                {nextTopic && (
                  <Button
                    className="mt-4 w-full justify-between gap-3 rounded-full sm:w-auto"
                    onClick={() => navigate(`/career-prep/topic/${nextTopic.slug}`)}
                  >
                    <span className="truncate">
                      {doneCount === 0 ? 'Start: ' : 'Continue: '}{nextTopic.title}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </Button>
                )}
                {!nextTopic && (
                  <p className="mt-3 text-sm font-bold text-success">
                    Every topic passed — the final assessment is next.
                  </p>
                )}
              </>
            )}

            {showSwitcher && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  Switching archives your current plan rather than deleting it — topic progress is kept
                  and carries across any plan that shares a topic.
                </p>
                <div className="flex flex-wrap gap-2">
                  {journeys
                    .filter((j) => j.id !== journey.id)
                    .map((j) => (
                      <Button
                        key={j.id}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={enrol.isPending}
                        onClick={() => enrol.mutate(j.id, { onSuccess: () => setShowSwitcher(false) })}
                      >
                        {j.title}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <Progress value={Math.round(stats.levelProgress * 100)} className="h-1.5" />
              {stats.nextLevelXp !== null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats.nextLevelXp - stats.xp} XP to level {stats.level + 1}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">What are you working toward?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              One question. Skip it and browse — nothing is locked.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {journeys.map((j) => (
                <Button
                  key={j.id}
                  className="rounded-full"
                  disabled={enrol.isPending}
                  onClick={() => enrol.mutate(j.id)}
                >
                  {j.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ClaimProfileCard />

      {/* The other way in. A learner with a screening next week wants to drill
          questions, not enrol in a 12-week plan — so the choice is explicit
          rather than the Library being buried. */}
      <button
        onClick={() => navigate(journey ? `/career-prep/library?journey=${journey.slug}` : '/career-prep/library')}
        className="mb-6 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          <Library className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">
            {journey ? `Practise ${journey.title} questions` : 'Just practise questions'}
          </span>
          <span className="block text-xs text-muted-foreground">
            {journey
              ? `${pool.length} questions and case studies from your plan — browse and filter.`
              : `${questions.filter((q) => !q.parent_id).length} questions and case studies — browse and filter, no Journey needed.`}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {daily?.question && (
        <button
          onClick={() => onOpenQuestion(daily.question!.slug)}
          className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Today's challenge
            </span>
            <span className="block line-clamp-2 text-sm font-bold leading-snug">{daily.question.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {daily.question.industry} · {daily.question.difficulty} ·{' '}
              {journey ? `same for everyone on ${journey.title} today` : 'same question for everyone today'}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      )}

      {nextUp.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Next up
          </h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {nextUp.map((item) => (
              <button
                key={`${item.kind}-${item.slug}-${item.step_slug ?? ''}`}
                onClick={() =>
                  item.kind === 'retry' && item.roadmap_slug
                    ? navigate(`/roadmaps/${item.roadmap_slug}`)
                    : onOpenQuestion(item.slug)
                }
                className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                  item.kind === 'retry' ? 'bg-warning-soft text-warning' : 'bg-primary/10 text-primary'
                }`}>
                  {item.kind === 'retry' ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-2 text-sm font-bold leading-snug">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.kind === 'retry'
                      ? 'Checkpoint to retry'
                      : `${item.industry} · ${item.difficulty}`}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cross-sell sits above the Library in the Journey-first layout, so the
          offer is seen in the context of the plan rather than after a long list. */}
      <JourneyOffers journeyId={journey?.id ?? journeys[0]?.id} />

      {journey && plan.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                The plan
              </h3>
              <span className="text-xs text-muted-foreground">
                {plan.reduce((n, r) => n + (r.duration_weeks ?? 0), 0)} weeks total
              </span>
            </div>
            <JourneyTimeline
              plan={plan}
              currentWeek={journeyPosition(plan, enrolment?.started_at).week}
              journeySlug={journey.slug}
            />
          </CardContent>
        </Card>
      )}

    </section>
  );
};

export default JourneyPanel;
