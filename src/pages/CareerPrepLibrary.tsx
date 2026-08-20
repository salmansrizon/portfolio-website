import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle2, Circle, ChevronRight, ChevronLeft, Loader2, ArrowLeft } from 'lucide-react';
import { useJourneys } from '@/hooks/useJourney';
import { useJourneyQuestionPool } from '@/hooks/useJourneyScope';
import { TableSkeleton } from '@/components/ui/skeletons';
import { useQuestions, useCompletedMissions } from '@/hooks/useCareerPrep';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * The Library — every Question, browsable and filterable, independent of any
 * Journey.
 *
 * It lives on its own route rather than on the Career Prep dashboard so a
 * learner can choose: follow a Journey, or just drill questions. Interview
 * candidates with a screening next week want the second, and burying it under a
 * plan they have not enrolled in serves them badly.
 */

const QUESTION_TYPES = ['All', 'MCQ', 'Coding Test', 'Case Study'] as const;
type QuestionTypeFilter = typeof QUESTION_TYPES[number];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;
type DifficultyFilter = typeof DIFFICULTIES[number];

const TYPE_MAP: Record<QuestionTypeFilter, string | null> = {
  All: null,
  MCQ: 'mcq',
  'Coding Test': 'code',
  'Case Study': 'case_study',
};

const difficultyTone: Record<string, string> = {
  Easy: 'bg-success-soft text-success-strong',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
};

const CareerPrepLibrary = () => {
  const navigate = useNavigate();
  const { questions, loading } = useQuestions();

  // ?journey=<slug> scopes the Library to one plan. It is a filter, not a wall:
  // the scope is named in the heading and one click removes it, because the
  // Library is also the surface for someone who just wants to drill anything.
  const [params, setParams] = useSearchParams();
  const journeySlug = params.get('journey') ?? undefined;
  const { journeys } = useJourneys();
  const scopedJourney = journeys.find((j) => j.slug === journeySlug) ?? null;
  const { pool } = useJourneyQuestionPool(scopedJourney?.id);
  const poolIds = useMemo(() => new Set(pool.map((q) => q.id)), [pool]);
  const { completedIds } = useCompletedMissions();
  const isMobile = useIsMobile();

  const [type, setType] = useState<QuestionTypeFilter>('All');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const target = TYPE_MAP[type];
    const needle = search.trim().toLowerCase();

    return questions.filter((q: any) => {
      if (scopedJourney && poolIds.size > 0 && !poolIds.has(q.id)) return false;
      // Mission children are reached through their parent, never listed loose.
      if (target) {
        if (q.question_type !== target) return false;
      } else if (q.parent_id) {
        return false;
      }
      if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
      if (!needle) return true;
      return (
        q.title?.toLowerCase().includes(needle) ||
        q.content_md?.toLowerCase().includes(needle) ||
        q.industry?.toLowerCase().includes(needle)
      );
    });
  }, [questions, type, difficulty, search, scopedJourney, poolIds]);

  const pageSize = isMobile ? 10 : 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  useEffect(() => setPage(1), [type, difficulty, search]);

  const solved = filtered.filter((q: any) => completedIds.has(q.id)).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 pb-16 pt-28">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
          <Link to="/career-prep"><ArrowLeft className="h-4 w-4" /> Career Prep</Link>
        </Button>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {scopedJourney ? `${scopedJourney.title} practice` : 'Practice Library'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {scopedJourney
            ? 'Every question and case study in your plan, in any order.'
            : 'Every question and case study, in any order. No Journey required.'}
        </p>
        {scopedJourney && (
          <button
            onClick={() => setParams({})}
            className="mt-2 text-xs font-bold text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Show every question instead
          </button>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                type === t
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/50 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  difficulty === d
                    ? 'bg-foreground text-background'
                    : `${difficultyTone[d] ?? 'bg-muted text-muted-foreground'} opacity-80 hover:opacity-100`
                }`}
              >
                {d}
              </button>
            ))}
            <span className="ml-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
              {solved}/{filtered.length} solved
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions…"
              className="border-border/50 bg-background/50 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[50px] text-center text-[10px] font-bold uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Question</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Focus Area</TableHead>
                <TableHead className="w-[100px] text-[10px] font-bold uppercase">Complexity</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <TableSkeleton rows={8} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs font-bold uppercase text-muted-foreground">
                    Nothing matches those filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((q: any) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/career-prep/solve/${q.slug}`)}
                  >
                    <TableCell className="text-center">
                      {completedIds.has(q.id) ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <Circle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-bold">{q.title}</TableCell>
                    <TableCell className="text-[11px] font-black uppercase tracking-widest text-primary/80">
                      {q.industry}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${difficultyTone[q.difficulty] ?? ''} border-0 text-[10px]`}>
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" className="h-8 px-3"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline" size="sm" className="h-8 px-3"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPrepLibrary;
