import { useState } from 'react';
import { RowSkeleton } from '@/components/ui/skeletons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';

// The funnel, read from `funnel_summary()`. Admin-gated in the database, not
// just in the UI — the function raises if the caller is not an admin.
//
// Stages are counted by DISTINCT VISITOR rather than by event: a conversion rate
// over raw event counts flatters itself the moment anyone repeats an action.

const STAGES = ['arrived', 'engaged', 'solved', 'identified', 'committed', 'returned', 'enrolled'] as const;

interface Summary {
  stages: Record<string, number> | null;
  by_surface: { surface: string; event: string; n: number }[];
  daily: { day: string; n: number }[];
  leads: number;
  enrolments: number;
  certificates: number;
  solves: number;
}

const FunnelDashboard = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ['funnel-summary', days],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('funnel_summary', { p_days: days });
      if (error) throw error;
      return data as Summary;
    },
  });

  if (isLoading) return <RowSkeleton count={6} />;
  if (error) {
    return (
      <p className="py-8 text-center text-sm text-danger">
        {(error as Error).message}
      </p>
    );
  }

  const stages = data?.stages ?? {};
  const top = Math.max(...STAGES.map((s) => stages[s] ?? 0), 1);
  const peakDay = Math.max(...(data?.daily ?? []).map((d) => d.n), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Funnel</h2>
          <p className="text-xs text-muted-foreground">
            Stages are distinct visitors, not raw events.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Solves', data?.solves],
          ['Ebook leads', data?.leads],
          ['Enrolments', data?.enrolments],
          ['Certificates', data?.certificates],
        ].map(([label, n]) => (
          <Card key={label as string}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{(n as number) ?? 0}</p>
              <p className="text-xs text-muted-foreground">{label as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Stages
          </h3>
          <div className="space-y-2">
            {STAGES.map((s) => {
              const n = stages[s] ?? 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium">{s}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                    <div
                      className="h-full rounded-md bg-primary/70"
                      style={{ width: `${Math.max((n / top) * 100, n > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-bold">{n}</span>
                </div>
              );
            })}
          </div>
          {Object.keys(stages).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events yet in this window.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Events per day
            </h3>
            <div className="flex h-24 items-end gap-1">
              {(data?.daily ?? []).map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.n}`}
                  className="flex-1 rounded-t bg-primary/60"
                  style={{ height: `${(d.n / peakDay) * 100}%` }}
                />
              ))}
              {(data?.daily ?? []).length === 0 && (
                <p className="w-full text-center text-sm text-muted-foreground">No data.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> Top surface / event
            </h3>
            <div className="space-y-1.5">
              {(data?.by_surface ?? []).map((r, i) => (
                <div key={`${r.surface}-${r.event}-${i}`} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-muted-foreground">
                    {r.surface} · {r.event}
                  </span>
                  <span className="font-bold">{r.n}</span>
                </div>
              ))}
              {(data?.by_surface ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No data.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunnelDashboard;
