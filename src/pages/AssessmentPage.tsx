import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, ArrowLeft, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import {
  ASSESSMENT_MINUTES, useStartAssessment, useAssessmentQuestions,
  useSubmitAssessment, type AssessmentResult,
} from '@/hooks/useAssessment';
import { useJourneys } from '@/hooks/useJourney';

/**
 * The timed final assessment.
 *
 * The timer is a display of a server-recorded start time, not the thing that
 * decides anything — the attempt row holds `started_at`, and grading happens in
 * the database. Running out of time submits what is answered rather than
 * discarding the attempt: losing an hour's work to a dropped connection would be
 * a far worse failure than a slightly generous clock.
 */
const AssessmentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { journeys } = useJourneys();
  const journey = journeys.find((j) => j.slug === slug);

  const start = useStartAssessment();
  const submit = useSubmitAssessment();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const { questions, loading } = useAssessmentQuestions(attemptId);

  useEffect(() => {
    if (!endsAt || result) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt, result]);

  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  const answered = Object.keys(answers).length;

  const finish = useMemo(
    () => async () => {
      if (!attemptId || submit.isPending) return;
      const res = await submit.mutateAsync({ attemptId, answers });
      setResult(res);
    },
    [attemptId, answers, submit],
  );

  // Time up: submit what exists rather than losing the attempt.
  useEffect(() => {
    if (endsAt && remaining === 0 && !result && attemptId) void finish();
  }, [endsAt, remaining, result, attemptId, finish]);

  const begin = async () => {
    if (!journey) return;
    const res = await start.mutateAsync(journey.id);
    setAttemptId(res.attemptId);
    setEndsAt(Date.now() + ASSESSMENT_MINUTES * 60 * 1000);
  };

  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-28">
        {/* ── Result ─────────────────────────────────────────────────────── */}
        {result ? (
          <div className="text-center">
            <div className={`mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full ${result.passed ? 'bg-success-soft' : 'bg-muted'}`}>
              {result.passed
                ? <Trophy className="h-10 w-10 text-success" />
                : <AlertCircle className="h-10 w-10 text-muted-foreground" />}
            </div>
            <h1 className="text-3xl font-extrabold">
              {result.passed ? 'Passed' : 'Not this time'} — {result.score} of {result.total}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {result.passed
                ? 'Your certificate has been issued.'
                : 'The pass mark is 70%. Nothing is lost — your progress and XP are untouched.'}
            </p>

            {result.certificate_id && (
              <Card className="mt-6 text-left">
                <CardContent className="p-5">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-success">
                    <ShieldCheck className="h-3.5 w-3.5" /> Certificate issued
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Anyone can check it at the verification link — it states exactly what was assessed.
                  </p>
                  <Button className="w-full rounded-full" onClick={() => navigate(`/verify/${result.certificate_id}`)}>
                    View my certificate
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button asChild variant="ghost" className="mt-4 rounded-full">
              <Link to="/career-prep">Back to Career Prep</Link>
            </Button>
          </div>
        ) : !attemptId ? (
          /* ── Entry ───────────────────────────────────────────────────── */
          <div className="text-center">
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
              <Link to="/career-prep"><ArrowLeft className="h-4 w-4" /> Career Prep</Link>
            </Button>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <Timer className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold">Final assessment</h1>
            <p className="mb-6 text-muted-foreground">{journey?.title ?? 'Journey'}</p>

            <Card className="mb-6 text-left">
              <CardContent className="space-y-2 p-5 text-sm">
                <p>· 12 questions, {ASSESSMENT_MINUTES} minutes</p>
                <p>· The questions are chosen by the server, not by you</p>
                <p>· Answers are graded server-side</p>
                <p>· Pass mark is 70%</p>
                <p>· Running out of time submits what you have answered</p>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full rounded-full" disabled={!journey || start.isPending} onClick={begin}>
              {start.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start the assessment
            </Button>
            {start.isError && (
              <p className="mt-3 text-xs text-danger">{(start.error as Error).message}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">The timer starts as soon as you begin.</p>
          </div>
        ) : (
          /* ── Paper ───────────────────────────────────────────────────── */
          <>
            <div className="sticky top-16 z-20 mb-6 flex items-center justify-between gap-4 rounded-2xl border bg-background/95 p-3 backdrop-blur">
              <span className="inline-flex items-center gap-2 font-mono text-lg font-bold">
                <Timer className={`h-4 w-4 ${remaining < 5 * 60000 ? 'text-danger' : 'text-primary'}`} />
                {mm}:{ss}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <Progress value={(answered / Math.max(questions.length, 1)) * 100} className="h-1.5" />
                <span className="shrink-0 text-xs text-muted-foreground">{answered}/{questions.length}</span>
              </div>
              <Button size="sm" className="rounded-full" disabled={submit.isPending} onClick={finish}>
                Submit
              </Button>
            </div>

            {loading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary opacity-40" />
            ) : (
              <ol className="space-y-6">
                {questions.map((q, i) => (
                  <li key={q.id}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-black text-muted-foreground">{i + 1}</span>
                          <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                          <Badge variant="outline" className="text-[10px]">{q.industry}</Badge>
                        </div>
                        <p className="mb-1 font-bold">{q.title}</p>
                        {q.content_md && (
                          <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">{q.content_md}</p>
                        )}
                        <div className="space-y-2">
                          {q.options.map((o) => (
                            <button
                              key={o.label}
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.label }))}
                              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                                answers[q.id] === o.label
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold">
                                {o.label}
                              </span>
                              <span className="flex-1">{o.text}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            )}

            <Button className="mt-6 w-full rounded-full" size="lg" disabled={submit.isPending} onClick={finish}>
              {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit assessment
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
