import { Link, useParams } from 'react-router-dom';
import { RowSkeleton } from '@/components/ui/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Trophy, ShieldCheck, Lock, Loader2, Link2, CheckCircle2 } from 'lucide-react';
import { usePublicProfile } from '@/hooks/useProfile';
import { levelFor, streakFrom } from '@/lib/levels';

/**
 * `/u/:username` — the public profile.
 *
 * The bar this is designed against: does it read as credible to a hiring manager
 * who has never heard of this site? So it shows solved question *titles* and
 * verifiable certificates, and never submitted code, email or phone.
 */

const difficultyTone: Record<string, string> = {
  Easy: 'bg-success-soft text-success-strong',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
};

const ContributionCalendar = ({ dates, timeZone }: { dates: string[]; timeZone: string }) => {
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  const counts = new Map<string, number>();
  for (const d of dates) {
    const k = dayKey(new Date(d));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const weeks = 26;
  const today = new Date();
  const cells: { key: string; n: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    cells.push({ key: k, n: counts.get(k) ?? 0 });
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {cells.slice(w * 7, w * 7 + 7).map((c) => (
            <div
              key={c.key}
              title={`${c.key}: ${c.n} solved`}
              className={`h-[10px] w-[10px] rounded-[2px] ${
                c.n > 3 ? 'bg-success' : c.n > 1 ? 'bg-success/60' : c.n > 0 ? 'bg-success/30' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, loading } = usePublicProfile(username);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-32">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-8"><RowSkeleton count={4} /></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 pb-20 pt-32 text-center">
          <h1 className="text-xl font-bold">No such profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nobody has claimed <span className="font-mono">{username}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (!profile.is_public) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 pb-20 pt-32 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-xl font-bold">This profile is private</h1>
          <p className="text-sm text-muted-foreground">
            Certificates issued to this learner can still be verified directly with their credential link.
          </p>
        </div>
      </div>
    );
  }

  const dates = profile.solve_dates ?? [];
  const tz = 'Asia/Dhaka';
  const { current, longest } = streakFrom(dates, tz);
  const standing = levelFor(profile.xp ?? 0);
  const solved = profile.solved ?? [];
  const certificates = profile.certificates ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-28">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{profile.display_name}</h1>
            <p className="text-muted-foreground">
              /u/{profile.username}
              {profile.joined_at && ` · joined ${new Date(profile.joined_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`}
            </p>
          </div>
          <Button
            variant="outline" size="sm" className="gap-1.5 rounded-full"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            <Link2 className="h-3.5 w-3.5" /> Copy link
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Card className="min-w-[130px] flex-1">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{standing.level}</p>
              <p className="text-xs text-muted-foreground">{standing.name ?? 'Level'}</p>
            </CardContent>
          </Card>
          <Card className="min-w-[130px] flex-1">
            <CardContent className="p-4">
              <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
                <Zap className="h-5 w-5 text-primary" />{(profile.xp ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">XP</p>
            </CardContent>
          </Card>
          <Card className="min-w-[130px] flex-1">
            <CardContent className="p-4">
              <p className="inline-flex items-center gap-1.5 text-2xl font-bold">
                <Flame className="h-5 w-5 text-warning" />{current}
              </p>
              <p className="text-xs text-muted-foreground">longest {longest}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {dates.length} solves in the last 6 months
            </p>
            <ContributionCalendar dates={dates} timeZone={tz} />
          </CardContent>
        </Card>

        {certificates.map((c) => (
          <Card key={c.id} className="border-success/30">
            <CardContent className="flex items-start gap-3 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.title}</p>
                <p className="mb-2 text-sm text-muted-foreground">
                  Issued {new Date(c.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to={`/verify/${c.id}`}>Verify credential</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {solved.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              Solved
            </h2>
            <div className="space-y-2">
              {solved.slice(0, 20).map((s, i) => (
                <div key={`${s.title}-${i}`} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <Badge className={`${difficultyTone[s.difficulty] ?? ''} border-0 text-[10px]`}>
                    {s.difficulty}
                  </Badge>
                  <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">{s.industry}</Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Submitted solutions are never shown publicly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
