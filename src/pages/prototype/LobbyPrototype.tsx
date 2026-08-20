// ⚠️ PROTOTYPE — THROWAWAY. Not production code.
// Answers ticket 10 on the careerprep-edtech map: what should the redesigned
// /career-prep landing state look like?
//
// Three radically different variants, switchable from the floating bar.
// All data is mock and in-memory. Nothing here talks to Supabase.
// Delete this whole directory once the direction is chosen.

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flame, Zap, Trophy, ChevronRight, Play, RotateCcw, Lock,
  CheckCircle2, Circle, Search, BookOpen, Calendar, GraduationCap,
} from 'lucide-react';

// ── Mock data ────────────────────────────────────────────────────────────────

const JOURNEY = {
  title: 'Data Engineer',
  week: 3,
  totalWeeks: 16,
  percent: 24,
  roadmaps: [
    { title: 'SQL Foundations', steps: 8, done: 8, state: 'done', due: null },
    { title: 'Advanced SQL', steps: 6, done: 3, state: 'active', due: 'Sep 2' },
    { title: 'Data Modelling', steps: 5, done: 0, state: 'locked', due: 'Sep 15' },
    { title: 'Pipelines & Airflow', steps: 0, done: 0, state: 'course', due: null },
    { title: 'Final assessment', steps: 0, done: 0, state: 'assessment', due: 'Nov 30' },
  ],
};

const NEXT_UP = [
  { kind: 'retry', title: 'Checkpoint: CTEs', meta: 'failed Tuesday', mins: 5 },
  { kind: 'step', title: 'Window Functions', meta: 'Advanced SQL', mins: 25 },
  { kind: 'daily', title: 'Daily challenge', meta: '+30 XP', mins: 10 },
];

const STATS = { streak: 12, xp: 1240, level: 4, nextLevel: 1400 };

const LIBRARY = [
  { title: 'Top merchants by cash-out volume', difficulty: 'Hard', industry: 'Fintech' },
  { title: 'Rider utilisation by district', difficulty: 'Medium', industry: 'Logistics' },
  { title: 'Repeat purchase cohort', difficulty: 'Medium', industry: 'E-commerce' },
  { title: 'Failed recharge attempts', difficulty: 'Easy', industry: 'Telco' },
];

const difficultyTone: Record<string, string> = {
  Easy: 'bg-success-soft text-success-strong',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
};

// ── Shared bits ──────────────────────────────────────────────────────────────

const StatPills = () => (
  <div className="flex items-center gap-4 text-sm">
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <Flame className="h-4 w-4 text-warning" /> {STATS.streak}
    </span>
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <Zap className="h-4 w-4 text-primary" /> {STATS.xp.toLocaleString()} XP
    </span>
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <Trophy className="h-4 w-4 text-success" /> Level {STATS.level}
    </span>
  </div>
);

const NextUpRow = ({ item }: { item: (typeof NEXT_UP)[number] }) => {
  const Icon = item.kind === 'retry' ? RotateCcw : item.kind === 'daily' ? Calendar : Play;
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${item.kind === 'retry' ? 'bg-warning-soft text-warning' : 'bg-primary/10 text-primary'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">~{item.mins}m</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
};

const PlanRow = ({ r }: { r: (typeof JOURNEY.roadmaps)[number] }) => {
  const icon =
    r.state === 'done' ? <CheckCircle2 className="h-4 w-4 text-success" />
    : r.state === 'active' ? <Circle className="h-4 w-4 text-primary fill-primary/20" />
    : r.state === 'course' ? <GraduationCap className="h-4 w-4 text-series-webinar" />
    : <Lock className="h-4 w-4 text-muted-foreground" />;

  return (
    <div className="flex items-center gap-3 py-2.5">
      {icon}
      <span className={`flex-1 text-sm ${r.state === 'locked' ? 'text-muted-foreground' : 'font-medium'}`}>
        {r.title}
        {r.state === 'course' && (
          <Badge variant="outline" className="ml-2 text-[10px]">not assessable here — Course</Badge>
        )}
      </span>
      {r.steps > 0 && <span className="text-xs text-muted-foreground">{r.done}/{r.steps}</span>}
      {r.due && <span className="text-xs text-muted-foreground w-16 text-right">{r.due}</span>}
    </div>
  );
};

const LibraryList = ({ compact = false }: { compact?: boolean }) => (
  <div className="space-y-2">
    {!compact && (
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm"
          placeholder="Search the Library…"
          readOnly
        />
      </div>
    )}
    {LIBRARY.slice(0, compact ? 3 : 4).map((q) => (
      <div key={q.title} className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50 cursor-pointer">
        <span className="flex-1 truncate">{q.title}</span>
        <Badge className={`${difficultyTone[q.difficulty]} border-0 text-[10px]`}>{q.difficulty}</Badge>
        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{q.industry}</Badge>
      </div>
    ))}
  </div>
);

const CrossSell = ({ kind }: { kind: 'course' | 'webinar' | 'ebook' }) => {
  const copy = {
    course: { title: 'Advanced SQL for Data Engineers', sub: 'Covers window functions in depth', cta: 'View course' },
    webinar: { title: 'Live: Cracking the bKash SQL round', sub: 'Sat 8pm · free', cta: 'Register' },
    ebook: { title: '50 SQL Interview Questions', sub: 'Free PDF, emailed to you', cta: 'Get it' },
  }[kind];
  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          {kind === 'course' ? 'Recommended course' : kind === 'webinar' ? 'Upcoming webinar' : 'Free resource'}
        </p>
        <p className="font-semibold text-sm">{copy.title}</p>
        <p className="text-xs text-muted-foreground mb-3">{copy.sub}</p>
        <Button size="sm" className="w-full rounded-full">{copy.cta}</Button>
      </CardContent>
    </Card>
  );
};

// ── Variant A — Journey First ────────────────────────────────────────────────
// The plan dominates. Library is demoted to a strip at the bottom.

const VariantA = ({ enrolled }: { enrolled: boolean }) => (
  <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
    {enrolled ? (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Journey</p>
              <h1 className="text-2xl font-bold">{JOURNEY.title}</h1>
              <p className="text-sm text-muted-foreground">Week {JOURNEY.week} of {JOURNEY.totalWeeks}</p>
            </div>
            <StatPills />
          </div>
          <Progress value={JOURNEY.percent} className="h-2" />
        </CardContent>
      </Card>
    ) : (
      <Card className="bg-primary/5">
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">What are you working toward?</h1>
          <p className="text-sm text-muted-foreground mb-6">One question. Skip it and browse — nothing is locked.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button className="rounded-full">Data Analyst</Button>
            <Button className="rounded-full">Data Engineer</Button>
            <Button variant="outline" className="rounded-full">Just exploring</Button>
          </div>
        </CardContent>
      </Card>
    )}

    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Next up</h2>
      <div className="space-y-2">{NEXT_UP.map((i) => <NextUpRow key={i.title} item={i} />)}</div>
    </div>

    <Card>
      <CardContent className="p-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">The plan</h2>
        <div className="divide-y">{JOURNEY.roadmaps.map((r) => <PlanRow key={r.title} r={r} />)}</div>
      </CardContent>
    </Card>

    <div className="grid gap-4 sm:grid-cols-2">
      <CrossSell kind="course" />
      <CrossSell kind="webinar" />
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Library</h2>
        <Button variant="ghost" size="sm">Browse all →</Button>
      </div>
      <LibraryList compact />
    </div>
  </div>
);

// ── Variant B — Two Column Dashboard ─────────────────────────────────────────
// Everything visible at once. Stats bar on top, plan and library side by side.

const VariantB = ({ enrolled }: { enrolled: boolean }) => (
  <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
      <div>
        <h1 className="text-xl font-bold">{enrolled ? JOURNEY.title : 'Career Prep'}</h1>
        <p className="text-sm text-muted-foreground">
          {enrolled ? `Week ${JOURNEY.week} of ${JOURNEY.totalWeeks} · ${JOURNEY.percent}%` : 'Practise real SQL from Bangladeshi tech companies'}
        </p>
      </div>
      {enrolled ? <StatPills /> : <Button className="rounded-full">Pick your Journey</Button>}
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Next up</h2>
          <div className="space-y-2">{NEXT_UP.map((i) => <NextUpRow key={i.title} item={i} />)}</div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Library</h2>
          <LibraryList />
        </div>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">The plan</h2>
            <div className="divide-y">{JOURNEY.roadmaps.map((r) => <PlanRow key={r.title} r={r} />)}</div>
          </CardContent>
        </Card>
        <CrossSell kind="course" />
        <CrossSell kind="ebook" />
      </aside>
    </div>
  </div>
);

// ── Variant C — Single Focus ─────────────────────────────────────────────────
// One thing to do. Everything else is below the fold, deliberately.

const VariantC = ({ enrolled }: { enrolled: boolean }) => (
  <div className="mx-auto max-w-3xl px-4 py-16">
    {enrolled ? (
      <>
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{JOURNEY.title} · Week {JOURNEY.week} of {JOURNEY.totalWeeks}</p>
          <StatPills />
        </div>

        <Card className="mb-4 border-2 border-primary/30">
          <CardContent className="p-8">
            <Badge className="mb-3 bg-warning-soft text-warning border-0">Pick up where you left off</Badge>
            <h1 className="mb-1 text-3xl font-bold">Checkpoint: CTEs</h1>
            <p className="mb-6 text-muted-foreground">You missed this on Tuesday. 5 minutes to clear it.</p>
            <Button size="lg" className="rounded-full">Retry checkpoint <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </CardContent>
        </Card>

        <div className="mb-10 grid gap-2 sm:grid-cols-2">
          {NEXT_UP.slice(1).map((i) => <NextUpRow key={i.title} item={i} />)}
        </div>

        <details className="rounded-2xl border p-4">
          <summary className="cursor-pointer text-sm font-semibold">See the whole plan</summary>
          <div className="mt-3 divide-y">{JOURNEY.roadmaps.map((r) => <PlanRow key={r.title} r={r} />)}</div>
        </details>
      </>
    ) : (
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold">Learn SQL by solving real problems</h1>
        <p className="mb-8 text-muted-foreground">
          Questions written from bKash, Pathao and ShopUp interview rounds. Free, no signup to start.
        </p>
        <Card className="mb-6 text-left">
          <CardContent className="p-6">
            <Badge className="mb-3">Start here</Badge>
            <h2 className="mb-1 text-xl font-bold">Data Analyst</h2>
            <p className="mb-4 text-sm text-muted-foreground">4 Roadmaps · 12 weeks · certificate at the end</p>
            <div className="flex gap-2">
              <Button className="rounded-full">Start this Journey</Button>
              <Button variant="outline" className="rounded-full">Data Engineer instead</Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-left">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Or just browse</h2>
          <LibraryList compact />
        </div>
      </div>
    )}

    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      <CrossSell kind="webinar" />
      <CrossSell kind="ebook" />
    </div>
  </div>
);

// ── Switcher ─────────────────────────────────────────────────────────────────

const VARIANTS = {
  a: { label: 'A · Journey First', Component: VariantA },
  b: { label: 'B · Dashboard', Component: VariantB },
  c: { label: 'C · Single Focus', Component: VariantC },
} as const;

type VariantKey = keyof typeof VARIANTS;

const LobbyPrototype = () => {
  const [params, setParams] = useSearchParams();
  const key = (params.get('v') as VariantKey) in VARIANTS ? (params.get('v') as VariantKey) : 'a';
  const [enrolled, setEnrolled] = useState(true);
  const { Component } = VARIANTS[key];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">
        PROTOTYPE — throwaway. Mock data. Ticket 10, careerprep-edtech map.
      </div>

      <Component enrolled={enrolled} />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          {(Object.keys(VARIANTS) as VariantKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={k === key ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setParams({ v: k })}
            >
              {VARIANTS[k].label}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">State:</span>
            <Button size="sm" variant={enrolled ? 'default' : 'outline'} className="rounded-full" onClick={() => setEnrolled(true)}>
              Enrolled
            </Button>
            <Button size="sm" variant={!enrolled ? 'default' : 'outline'} className="rounded-full" onClick={() => setEnrolled(false)}>
              Cold / skipped
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPrototype;
