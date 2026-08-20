// ⚠️ PROTOTYPE — THROWAWAY. Not production code.
// Answers ticket 12 on the careerprep-edtech map: what do the public profile,
// the certificate, and the public verify page look like?
//
// The bar these have to clear: does it read as credible to a hiring manager who
// has never heard of this site? Scenes switchable from the floating bar.
// Delete this whole directory once the direction is chosen.

import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Flame, Zap, CheckCircle2, ShieldCheck, Link2, Linkedin, Lock,
  Trophy, Clock, XCircle, Timer,
} from 'lucide-react';

const LEARNER = {
  name: 'Salman Sakib',
  username: 'salman',
  level: 10,
  levelName: 'Analyst',
  xp: 3840,
  streak: 12,
  longest: 34,
  joined: 'March 2026',
};

const SOLVED = [
  { title: 'Top merchants by cash-out volume', difficulty: 'Hard', industry: 'Fintech' },
  { title: 'Rider utilisation by district', difficulty: 'Medium', industry: 'Logistics' },
  { title: 'Repeat purchase cohort analysis', difficulty: 'Hard', industry: 'E-commerce' },
  { title: 'Churn by recharge frequency', difficulty: 'Hard', industry: 'Telco' },
];

const BADGES = [
  { name: 'Industry Native', rare: true, earned: true },
  { name: 'Hard Mode · 50', rare: true, earned: true },
  { name: 'Consistent · 30', rare: false, earned: true },
  { name: 'Mission Complete · 5', rare: false, earned: true },
  { name: 'Clean Sweep', rare: false, earned: false, progress: '7/10' },
  { name: 'Daily Devotee · 30', rare: false, earned: false, progress: '18/30' },
];

const difficultyTone: Record<string, string> = {
  Easy: 'bg-success-soft text-success-strong',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
};

// 26 weeks × 7 days of deterministic pseudo-activity
const CALENDAR = Array.from({ length: 26 * 7 }, (_, i) => (i * 7919) % 11);

const ContributionCalendar = () => (
  <div className="flex gap-[3px] overflow-x-auto pb-1">
    {Array.from({ length: 26 }, (_, w) => (
      <div key={w} className="flex flex-col gap-[3px]">
        {Array.from({ length: 7 }, (_, d) => {
          const v = CALENDAR[w * 7 + d];
          const tone =
            v > 8 ? 'bg-success' : v > 6 ? 'bg-success/60' : v > 4 ? 'bg-success/30' : 'bg-muted';
          return <div key={d} className={`h-[10px] w-[10px] rounded-[2px] ${tone}`} />;
        })}
      </div>
    ))}
  </div>
);

// ── Scene: public profile ────────────────────────────────────────────────────

const Profile = () => (
  <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{LEARNER.name}</h1>
        <p className="text-muted-foreground">
          careerprep.site/u/{LEARNER.username} · joined {LEARNER.joined}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <Link2 className="h-3.5 w-3.5" /> Copy link
        </Button>
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      <Card className="flex-1 min-w-[130px]">
        <CardContent className="p-4">
          <p className="text-2xl font-bold">{LEARNER.level}</p>
          <p className="text-xs text-muted-foreground">{LEARNER.levelName}</p>
        </CardContent>
      </Card>
      <Card className="flex-1 min-w-[130px]">
        <CardContent className="p-4">
          <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
            <Zap className="h-5 w-5 text-primary" />{LEARNER.xp.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">XP</p>
        </CardContent>
      </Card>
      <Card className="flex-1 min-w-[130px]">
        <CardContent className="p-4">
          <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
            <Flame className="h-5 w-5 text-warning" />{LEARNER.streak}
          </p>
          <p className="text-xs text-muted-foreground">longest {LEARNER.longest}</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardContent className="p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          182 solves in the last 6 months
        </p>
        <ContributionCalendar />
      </CardContent>
    </Card>

    <Card className="border-success/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="flex-1">
            <p className="font-semibold">Data Analyst — SQL portion</p>
            <p className="mb-2 text-sm text-muted-foreground">
              Certificate issued 12 Aug 2026 · assessed on 34 SQL problems under timed conditions
            </p>
            <Button variant="outline" size="sm" className="rounded-full">Verify credential</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Badges</h2>
      <div className="flex flex-wrap gap-2">
        {BADGES.map((b) => (
          <div
            key={b.name}
            className={`rounded-xl border px-3 py-2 text-sm ${b.earned ? '' : 'opacity-50'} ${b.rare && b.earned ? 'border-primary/40 bg-primary/5' : ''}`}
          >
            <span className="font-medium">{b.name}</span>
            {!b.earned && <span className="ml-2 text-xs text-muted-foreground">{b.progress}</span>}
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Pinned solves
      </h2>
      <div className="space-y-2">
        {SOLVED.map((s) => (
          <div key={s.title} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span className="flex-1">{s.title}</span>
            <Badge className={`${difficultyTone[s.difficulty]} border-0 text-[10px]`}>{s.difficulty}</Badge>
            <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">{s.industry}</Badge>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Submitted solutions are never shown publicly.
      </p>
    </div>
  </div>
);

// ── Scene: private profile as seen by a visitor ──────────────────────────────

const PrivateProfile = () => (
  <div className="mx-auto max-w-md px-4 py-24 text-center">
    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
      <Lock className="h-6 w-6 text-muted-foreground" />
    </div>
    <h1 className="mb-2 text-xl font-bold">This profile is private</h1>
    <p className="text-sm text-muted-foreground">
      Certificates issued to this learner can still be verified directly with their credential link.
    </p>
  </div>
);

// ── Scene: the certificate ───────────────────────────────────────────────────

const Certificate = () => (
  <div className="mx-auto max-w-2xl px-4 py-10">
    {/* Screenshot-worthy: seal, signature, double rule. The scope disclaimer stays —
        ceremony is what gets it shared, honesty is what makes it worth verifying. */}
    <Card className="relative overflow-hidden border-2 border-primary/30">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
      <CardContent className="p-10 text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-black">CP</span>
          </div>
          <span className="text-sm font-bold tracking-tight">Career Prep</span>
        </div>

        <div className="mx-auto mb-6 w-24 border-t-2 border-primary/40" />

        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Certificate of Assessment
        </p>
        <p className="mb-1 text-sm text-muted-foreground">This certifies that</p>
        <h1 className="mb-4 font-serif text-4xl font-bold">{LEARNER.name}</h1>
        <p className="mb-1 text-sm text-muted-foreground">was assessed on</p>
        <h2 className="mb-8 text-2xl font-bold">SQL for Data Analysis</h2>

        <div className="mx-auto mb-8 max-w-md rounded-xl bg-muted/50 p-4 text-left">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            What was assessed
          </p>
          <ul className="space-y-1 text-sm">
            <li>· 34 SQL problems solved and validated</li>
            <li>· Timed final assessment, 12 problems in 60 minutes</li>
            <li>· All Checkpoints in the Data Analyst Journey passed</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            This certificate covers the SQL portion of the Data Analyst Journey only. It does not
            assess Python, statistics, or business intelligence tooling.
          </p>
        </div>

        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="flex-1 text-left">
            <p className="mb-1 font-serif text-xl italic">Salman Sakib</p>
            <div className="mb-1 border-t" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Instructor</p>
          </div>

          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-primary/40 bg-primary/5">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-0.5 text-[7px] font-bold uppercase tracking-widest text-primary">Verified</p>
            </div>
          </div>

          <div className="flex-1 text-right">
            <p className="mb-1 text-sm font-medium">12 Aug 2026</p>
            <div className="mb-1 border-t" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Date issued</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">ID 8f3c-21ab-9d04</span>
          <span>·</span>
          <span>careerprep.site/verify/8f3c-21ab-9d04</span>
        </div>
      </CardContent>
    </Card>

    <div className="mt-4 flex flex-wrap gap-2">
      <Button className="gap-1.5 rounded-full"><Linkedin className="h-4 w-4" /> Add to LinkedIn</Button>
      <Button variant="outline" className="gap-1.5 rounded-full"><Link2 className="h-4 w-4" /> Copy verify link</Button>
    </div>
  </div>
);

// ── Scene: public verify page ────────────────────────────────────────────────

const Verify = ({ status }: { status: 'valid' | 'revoked' }) => (
  <div className="mx-auto max-w-xl px-4 py-16">
    <Card className={status === 'valid' ? 'border-success/40' : 'border-destructive/40'}>
      <CardContent className="p-8">
        <div className="mb-6 flex items-center gap-3">
          {status === 'valid' ? (
            <>
              <ShieldCheck className="h-8 w-8 text-success" />
              <div>
                <p className="text-lg font-bold text-success">Valid credential</p>
                <p className="text-xs text-muted-foreground">Verified just now</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">Revoked</p>
                <p className="text-xs text-muted-foreground">This credential is no longer valid</p>
              </div>
            </>
          )}
        </div>

        <dl className="space-y-3 text-sm">
          {[
            ['Issued to', LEARNER.name],
            ['Credential', 'SQL for Data Analysis'],
            ['Issued', '12 Aug 2026'],
            ['Credential ID', '8f3c-21ab-9d04'],
            ['Assessment', '12 problems, 60 minutes, timed'],
            ['Problems solved', '34 validated'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b pb-2 last:border-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs text-muted-foreground">
          Issued by Career Prep. Scope is limited to the SQL content assessed above.
        </p>
      </CardContent>
    </Card>
  </div>
);

// ── Scene: timed assessment ──────────────────────────────────────────────────

const Assessment = ({ phase }: { phase: 'entry' | 'result' }) =>
  phase === 'entry' ? (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
        <Timer className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Final assessment</h1>
      <p className="mb-6 text-muted-foreground">Data Analyst Journey</p>
      <Card className="mb-6 text-left">
        <CardContent className="space-y-2 p-5 text-sm">
          <p>· 12 problems, 60 minutes</p>
          <p>· No hints, no official solutions</p>
          <p>· Answers are validated on the server</p>
          <p>· One attempt — a retake unlocks at level 6</p>
        </CardContent>
      </Card>
      <Button size="lg" className="w-full rounded-full">Start the assessment</Button>
      <p className="mt-3 text-xs text-muted-foreground">The timer starts as soon as you begin.</p>
    </div>
  ) : (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-success-soft">
        <Trophy className="h-8 w-8 text-success" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Passed — 10 of 12</h1>
      <p className="mb-6 text-muted-foreground inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" /> finished in 47 minutes
      </p>
      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="font-semibold">Your certificate is ready</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Issued in your name, with a public verification link.
          </p>
          <Button className="w-full rounded-full">Issue my certificate</Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Anyone can check it at the verification link — the certificate states exactly what was assessed.
      </p>
    </div>
  );

// ── Switcher ─────────────────────────────────────────────────────────────────

const SCENES = {
  profile: { label: 'Public profile', render: () => <Profile /> },
  private: { label: 'Private profile', render: () => <PrivateProfile /> },
  cert: { label: 'Certificate', render: () => <Certificate /> },
  verify: { label: 'Verify · valid', render: () => <Verify status="valid" /> },
  revoked: { label: 'Verify · revoked', render: () => <Verify status="revoked" /> },
  assess: { label: 'Assessment entry', render: () => <Assessment phase="entry" /> },
  passed: { label: 'Assessment passed', render: () => <Assessment phase="result" /> },
} as const;

type SceneKey = keyof typeof SCENES;

const ProfilePrototype = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get('s') as SceneKey | null;
  const key: SceneKey = raw && raw in SCENES ? raw : 'profile';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">
        PROTOTYPE — throwaway. Mock data. Ticket 12, careerprep-edtech map.
      </div>

      {SCENES[key].render()}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
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

export default ProfilePrototype;
