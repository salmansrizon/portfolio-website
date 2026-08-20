// ⚠️ PROTOTYPE — THROWAWAY. Not production code.
// Answers ticket 11 on the careerprep-edtech map: what do the practice surfaces
// look like after the Roadmap/Question merge?
//
// Scenes are switchable from the floating bar. No Monaco, no PGLite, no Supabase —
// the editor is a plain textarea, results are mock. The question here is layout
// and moment-design, not execution.
// Delete this whole directory once the direction is chosen.

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Flame, Zap, CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  Play, Lightbulb, Trophy, BookOpen, Table2, AlertCircle,
} from 'lucide-react';

const STEP = { roadmap: 'Advanced SQL', index: 4, total: 6, title: 'Window Functions' };

const RESULT_ROWS = [
  { merchant: 'Rahim Store', volume: '৳ 4,82,000', txns: 1204 },
  { merchant: 'Bismillah Traders', volume: '৳ 3,91,500', txns: 998 },
  { merchant: 'City Mart', volume: '৳ 2,74,300', txns: 731 },
];

// ── Scene: the workspace ─────────────────────────────────────────────────────

const Workspace = ({ state }: { state: 'idle' | 'failed' | 'struggling' }) => (
  <div className="flex h-[calc(100vh-140px)] flex-col">
    {/* Progression context bar — new. Tells you where you are in the Roadmap. */}
    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5">
      <Button variant="ghost" size="sm" className="gap-1 px-2">
        <ChevronLeft className="h-4 w-4" /> {STEP.roadmap}
      </Button>
      <div className="flex items-center gap-2">
        <Progress value={(STEP.index / STEP.total) * 100} className="h-1.5 w-24" />
        <span className="text-xs text-muted-foreground">Step {STEP.index} of {STEP.total}</span>
      </div>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1 font-semibold"><Flame className="h-4 w-4 text-warning" />12</span>
        <span className="inline-flex items-center gap-1 font-semibold"><Zap className="h-4 w-4 text-primary" />1,240</span>
      </div>
    </div>

    <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[380px_1fr]">
      {/* Problem pane */}
      <div className="overflow-y-auto border-r p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge className="bg-danger-soft text-danger border-0">Hard</Badge>
          <Badge variant="outline">Fintech</Badge>
        </div>
        <h1 className="mb-3 text-xl font-bold">Top merchants by cash-out volume</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Find the top 5 merchants by total cash-out volume in the last 24 hours. Return merchant
          name, total volume, and transaction count, ranked highest first.
        </p>

        <div className="mb-4 rounded-xl border p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Schema</p>
          <pre className="text-xs text-muted-foreground">{`merchants(id, name, district)
transactions(id, merchant_id,
  type, amount, created_at)`}</pre>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2 rounded-full">
          <Lightbulb className="h-4 w-4" /> Show hint
        </Button>

        {state === 'struggling' && (
          <Card className="mt-4 border-dashed border-primary/40 bg-primary/5">
            <CardContent className="p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">Stuck on this one?</p>
              <p className="mb-3 text-sm font-semibold">50 SQL Interview Questions</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Free PDF covering window functions and ranking. Emailed to you.
              </p>
              <Button size="sm" className="w-full rounded-full">Get the free PDF</Button>
              <button className="mt-2 w-full text-[11px] text-muted-foreground underline">Not now</button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Editor + results */}
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Button size="sm" variant="outline" className="gap-1.5 rounded-lg"><Play className="h-3.5 w-3.5" /> Run</Button>
          <Button size="sm" className="rounded-lg">Submit</Button>
          <span className="ml-auto text-xs text-muted-foreground">⌘↵ to run</span>
        </div>

        <textarea
          className="min-h-[200px] flex-1 resize-none bg-muted/30 p-4 font-mono text-sm outline-none"
          defaultValue={`select m.name, sum(t.amount) as volume, count(*) as txns\nfrom transactions t\njoin merchants m on m.id = t.merchant_id\nwhere t.type = 'cash_out'\ngroup by m.name\norder by volume desc\nlimit 5;`}
        />

        <div className="max-h-[45%] overflow-y-auto border-t">
          {state === 'failed' ? (
            <div className="p-4">
              <div className="mb-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Not quite — 3 rows returned, expected 5</p>
                  <p className="text-xs text-muted-foreground">
                    Your filter on <code>created_at</code> is missing, so older transactions are excluded.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Attempt 2 · nothing is lost, try again</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Table2 className="h-3.5 w-3.5" /> 3 rows · 12ms
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">merchant</th>
                    <th className="pb-2 font-medium">volume</th>
                    <th className="pb-2 font-medium">txns</th>
                  </tr>
                </thead>
                <tbody>
                  {RESULT_ROWS.map((r) => (
                    <tr key={r.merchant} className="border-b last:border-0">
                      <td className="py-1.5">{r.merchant}</td>
                      <td className="py-1.5 font-mono text-xs">{r.volume}</td>
                      <td className="py-1.5 font-mono text-xs">{r.txns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ── Scene: checkpoint modal ──────────────────────────────────────────────────

const CheckpointModal = ({ outcome }: { outcome: 'asking' | 'wrong' }) => {
  const [picked, setPicked] = useState<string | null>(outcome === 'wrong' ? 'B' : null);
  const correct = 'C';
  const options = [
    { k: 'A', t: 'It filters rows before grouping' },
    { k: 'B', t: 'It removes duplicate rows from the result' },
    { k: 'C', t: 'It computes a value across a set of rows without collapsing them' },
    { k: 'D', t: 'It sorts the result set by a partition key' },
  ];

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Checkpoint</Badge>
          <span className="text-xs text-muted-foreground">{STEP.roadmap} · {STEP.title}</span>
        </div>
        <h2 className="mb-4 text-lg font-bold">What does a window function do?</h2>

        <div className="space-y-2">
          {options.map((o) => {
            const isPicked = picked === o.k;
            const showResult = outcome === 'wrong' && isPicked;
            const showCorrect = outcome === 'wrong' && o.k === correct;
            return (
              <button
                key={o.k}
                onClick={() => setPicked(o.k)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors
                  ${showResult ? 'border-destructive bg-destructive/5' : ''}
                  ${showCorrect ? 'border-success bg-success-soft' : ''}
                  ${!showResult && !showCorrect && isPicked ? 'border-primary bg-primary/5' : ''}
                  ${!isPicked && !showCorrect ? 'hover:bg-muted/50' : ''}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold">{o.k}</span>
                <span className="flex-1">{o.t}</span>
                {showResult && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
              </button>
            );
          })}
        </div>

        {outcome === 'wrong' ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2 rounded-xl bg-muted p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                A window function keeps every row and adds a computed column — unlike <code>group by</code>,
                which collapses rows. <strong>You can carry on to the next Step;</strong> this only needs to be
                passed before the certificate.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full">Continue anyway</Button>
              <Button className="flex-1 rounded-full">Try again</Button>
            </div>
          </div>
        ) : (
          <Button className="mt-4 w-full rounded-full" disabled={!picked}>Check answer</Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Scene: success + level up ────────────────────────────────────────────────

// Full-screen takeover, not a modal — the biggest moment in the product gets
// the whole viewport and no busy editor bleeding through behind it.
const Takeover = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-6 py-16">{children}</div>
  </div>
);

const SuccessScene = () => (
  <Takeover>
    <div className="text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-success-soft">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h2 className="text-4xl font-bold">Solved</h2>
      <p className="mb-8 text-muted-foreground">Top merchants by cash-out volume · Hard</p>

      <div className="mb-6 flex justify-center gap-10 rounded-2xl bg-muted/50 py-6">
        <div>
          <p className="text-3xl font-bold text-primary">+50</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-warning">13 🔥</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-success">4 → 5</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Level</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-success/30 bg-success-soft/50 p-4">
        <p className="font-bold text-success">Level 5 unlocked · Profile themes</p>
      </div>

      <Card className="mb-4 border-dashed text-left">
        <CardContent className="p-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recommended course</p>
          <p className="font-semibold">Advanced SQL for Data Engineers</p>
          <p className="mb-4 text-sm text-muted-foreground">Window functions in depth, with 40 more exercises</p>
          <Button className="w-full rounded-full">View course</Button>
        </CardContent>
      </Card>

      <Button variant="ghost" size="lg" className="w-full rounded-full gap-1">
        Next Step: Ranking & Percentiles <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </Takeover>
);

// ── Scene: the soft wall ─────────────────────────────────────────────────────

const SoftWall = () => (
  <Takeover>
    <div className="text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/10">
        <Trophy className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-3 text-4xl font-bold">Nice — first one solved</h2>
      <p className="mb-8 text-muted-foreground">
        You earned <strong className="text-foreground">50 XP</strong>, but it is not saved yet.
        Create an account to keep your progress — and pick up where you left off on any device.
      </p>
      <div className="space-y-3">
        <Button size="lg" className="w-full rounded-full">Save my progress</Button>
        <Button variant="ghost" size="lg" className="w-full rounded-full text-muted-foreground">
          Keep solving as a guest
        </Button>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Nothing is locked. You can carry on without an account.
      </p>
    </div>
  </Takeover>
);

// ── Switcher ─────────────────────────────────────────────────────────────────

const SCENES = {
  idle: { label: 'Workspace', render: () => <Workspace state="idle" /> },
  failed: { label: 'Failed submit', render: () => <Workspace state="failed" /> },
  struggle: { label: 'Struggle trigger', render: () => <Workspace state="struggling" /> },
  checkpoint: { label: 'Checkpoint', render: () => <><Workspace state="idle" /><CheckpointModal outcome="asking" /></> },
  checkfail: { label: 'Checkpoint failed', render: () => <><Workspace state="idle" /><CheckpointModal outcome="wrong" /></> },
  success: { label: 'Success + level up', render: () => <><Workspace state="idle" /><SuccessScene /></> },
  wall: { label: 'Soft wall', render: () => <><Workspace state="idle" /><SoftWall /></> },
} as const;

type SceneKey = keyof typeof SCENES;

const WorkspacePrototype = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get('s') as SceneKey | null;
  const key: SceneKey = raw && raw in SCENES ? raw : 'idle';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">
        PROTOTYPE — throwaway. Mock data, no PGLite. Ticket 11, careerprep-edtech map.
      </div>

      {SCENES[key].render()}

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {(Object.keys(SCENES) as SceneKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={k === key ? 'default' : 'outline'}
              className="rounded-full text-xs"
              onClick={() => setParams({ s: k })}
            >
              {SCENES[k].label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePrototype;
