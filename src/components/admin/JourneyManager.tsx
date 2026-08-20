import { useState } from 'react';
import { RowSkeleton } from '@/components/ui/skeletons';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyStage } from '@/hooks/useJourney';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ArrowUp, ArrowDown, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Journey Manager — an Editor Screen, not an Entity Manager: a Journey is a
// title plus an *ordered* list of Roadmaps with durations, which EntityFormDialog
// cannot express. See ticket 13.

interface Journey {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  goal: string;
  status: string;
  order_index: number;
  course_id: string | null;
  webinar_id: string | null;
  ebook_id: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);

// The editor's row shape: the same Stage the learner sees, minus the Topics —
// those are loaded per stage by StageTopics rather than with the whole plan.
type StageRow = Omit<JourneyStage, 'topics' | 'roadmap'>;


// Which Topics a Stage covers, in order. Topics are written in the Topics tab;
// this only arranges them, the same way Checkpoints are attached rather than
// authored inside a Step.
const StageTopics = ({ stageId }: { stageId: string }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: topics = [] } = useQuery({
    queryKey: ['admin-topics-min'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('topics').select('id, title, status').order('title');
      return (data ?? []) as { id: string; title: string; status: string }[];
    },
  });

  const { data: attached = [] } = useQuery({
    queryKey: ['admin-stage-topics', stageId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('stage_topics').select('id, topic_id, order_index').eq('stage_id', stageId).order('order_index');
      return (data ?? []) as { id: string; topic_id: string; order_index: number }[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-stage-topics', stageId] });
  const fail = (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' });

  const add = async (topicId: string) => {
    const nextOrder = (attached[attached.length - 1]?.order_index ?? -1) + 1;
    const { error } = await (supabase as any)
      .from('stage_topics').insert({ stage_id: stageId, topic_id: topicId, order_index: nextOrder });
    if (error) return fail(error);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from('stage_topics').delete().eq('id', id);
    if (error) return fail(error);
    refresh();
  };

  return (
    <div className="mt-2 w-full border-t pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {attached.map((a) => (
          <Badge key={a.id} variant="outline" className="gap-1 text-[10px]">
            {topics.find((t) => t.id === a.topic_id)?.title ?? 'Unknown topic'}
            <button className="text-destructive" onClick={() => remove(a.id)}>×</button>
          </Badge>
        ))}
        {attached.length === 0 && (
          <span className="text-[11px] text-muted-foreground">No topics yet — this stage shows as "coming soon".</span>
        )}
      </div>

      <select
        className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
        value=""
        onChange={(e) => e.target.value && add(e.target.value)}
      >
        <option value="">— add a topic —</option>
        {topics
          .filter((t) => !attached.some((a) => a.topic_id === t.id))
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}{t.status !== 'published' ? ' (draft)' : ''}
            </option>
          ))}
      </select>
    </div>
  );
};

const JourneyManager = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['admin-journeys'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('journeys').select('*').order('order_index');
      if (error) throw error;
      return (data ?? []) as Journey[];
    },
  });

  const { data: roadmaps = [] } = useQuery({
    queryKey: ['admin-roadmaps-min'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('roadmaps').select('id, title, status').order('order_index');
      return (data ?? []) as { id: string; title: string; status: string }[];
    },
  });

  // Everything a Journey can point at, so the offers are a picker rather than a
  // pasted UUID.
  const { data: offerable = { courses: [], webinars: [], ebooks: [] } } = useQuery({
    queryKey: ['admin-offerable'],
    queryFn: async () => {
      const [c, w, e] = await Promise.all([
        (supabase as any).from('courses').select('id, title').eq('status', 'published'),
        (supabase as any).from('webinars').select('id, title').eq('status', 'published'),
        (supabase as any).from('ebooks').select('id, title').eq('status', 'published'),
      ]);
      return {
        courses: (c.data ?? []) as { id: string; title: string }[],
        webinars: (w.data ?? []) as { id: string; title: string }[],
        ebooks: (e.data ?? []) as { id: string; title: string }[],
      };
    },
  });

  const journeyId = selected ?? journeys[0]?.id ?? null;
  const journey = journeys.find((j) => j.id === journeyId) ?? null;

  const saveJourney = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Journey> }) => {
      const { error } = await (supabase as any).from('journeys').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-journeys'] }),
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const createJourney = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await (supabase as any)
        .from('journeys')
        .insert({
          title,
          slug: slugify(title),
          goal: slugify(title).replace(/-/g, '_'),
          status: 'draft',
          order_index: journeys.length + 1,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      setSelected(id);
      qc.invalidateQueries({ queryKey: ['admin-journeys'] });
      toast({ title: 'Journey created', description: 'It starts as a draft — publish it when the plan is ready.' });
    },
    onError: (e: any) => toast({ title: 'Could not create', description: e.message, variant: 'destructive' }),
  });

  const { data: plan = [] } = useQuery({
    queryKey: ['admin-journey-plan', journeyId],
    enabled: !!journeyId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('journey_stages').select('*').eq('journey_id', journeyId).order('order_index');
      return (data ?? []) as StageRow[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-journey-plan'] });
    qc.invalidateQueries({ queryKey: ['admin-journeys'] });
  };

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<StageRow> }) => {
      const { error } = await (supabase as any).from('journey_stages').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const addStage = useMutation({
    mutationFn: async (title: string) => {
      if (!journeyId) return;
      const nextOrder = (plan[plan.length - 1]?.order_index ?? 0) + 1;
      const { error } = await (supabase as any).from('journey_stages').insert({
        journey_id: journeyId,
        title,
        order_index: nextOrder,
        duration_weeks: 4,
        is_assessable: true,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: any) => toast({ title: 'Could not add', description: e.message, variant: 'destructive' }),
  });

  const removeRow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('journey_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  // Swapping order_index needs a spare value first: the (journey_id, order_index)
  // unique constraint would reject the intermediate state otherwise.
  const move = async (row: StageRow, dir: -1 | 1) => {
    const other = plan.find((r) => r.order_index === row.order_index + dir);
    if (!other) return;
    await (supabase as any).from('journey_stages').update({ order_index: -1 }).eq('id', row.id);
    await (supabase as any).from('journey_stages').update({ order_index: row.order_index }).eq('id', other.id);
    await (supabase as any).from('journey_stages').update({ order_index: other.order_index }).eq('id', row.id);
    refresh();
  };

  const totalWeeks = plan.reduce((n, r) => n + (r.duration_weeks ?? 0), 0);

  if (isLoading) return <RowSkeleton count={6} />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Journeys</h2>
        <p className="text-xs text-muted-foreground">
          A Journey is an ordered list of Stages, and a Stage is an ordered list of Topics. Durations set the learner's visible end date. A Roadmap is optional reading, not the material.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {journeys.map((j) => (
          <Button
            key={j.id}
            variant={j.id === journeyId ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setSelected(j.id)}
          >
            {j.title}
            <Badge variant="secondary" className="ml-2 text-[10px]">{j.status}</Badge>
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => {
            const title = window.prompt('Journey title (e.g. "Machine Learning Engineer")');
            if (title?.trim()) createJourney.mutate(title.trim());
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> New Journey
        </Button>
      </div>

      {journey && (
        <Card>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</span>
              <Input
                defaultValue={journey.title}
                onBlur={(e) =>
                  e.target.value !== journey.title &&
                  saveJourney.mutate({ id: journey.id, patch: { title: e.target.value } })
                }
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</span>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                defaultValue={journey.status}
                onChange={(e) => saveJourney.mutate({ id: journey.id, patch: { status: e.target.value } })}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</span>
              <Input
                defaultValue={journey.description ?? ''}
                onBlur={(e) =>
                  saveJourney.mutate({ id: journey.id, patch: { description: e.target.value } })
                }
              />
            </label>

            {/* Explicit per-Journey offers — what the learner is shown in the
                lobby. Deliberately a picker, not tag matching. */}
            {([
              ['course_id', 'Course', offerable.courses],
              ['webinar_id', 'Webinar', offerable.webinars],
              ['ebook_id', 'Ebook', offerable.ebooks],
            ] as const).map(([field, label, items]) => (
              <label key={field} className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {label} offer
                </span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  defaultValue={(journey[field] as string | null) ?? ''}
                  onChange={(e) =>
                    saveJourney.mutate({
                      id: journey.id,
                      patch: { [field]: e.target.value || null } as Partial<Journey>,
                    })
                  }
                >
                  <option value="">— none —</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>{it.title}</option>
                  ))}
                </select>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {journeyId && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">The plan</h3>
              <span className="text-sm text-muted-foreground">
                {plan.length} stages · {totalWeeks} weeks total
              </span>
            </div>

            <div className="space-y-2">
              {plan.map((r, i) => {
                const roadmap = roadmaps.find((rm) => rm.id === r.roadmap_id);
                return (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
                    <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                      {r.order_index}
                    </span>

                    <Input
                      className="h-8 min-w-[180px] flex-1 text-sm font-medium"
                      defaultValue={r.title}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== r.title) save.mutate({ id: r.id, patch: { title: v } });
                      }}
                    />

                    {/* Optional reading, not the material — a Stage works without one. */}
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={r.roadmap_id ?? ''}
                      onChange={(e) => save.mutate({ id: r.id, patch: { roadmap_id: e.target.value || null } })}
                    >
                      <option value="">— no roadmap link —</option>
                      {roadmaps.map((rm) => (
                        <option key={rm.id} value={rm.id}>{rm.title}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      weeks
                      <Input
                        type="number"
                        min={1}
                        className="h-8 w-16"
                        defaultValue={r.duration_weeks}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v && v !== r.duration_weeks) save.mutate({ id: r.id, patch: { duration_weeks: v } });
                        }}
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      assessable
                      <Switch
                        checked={r.is_assessable}
                        onCheckedChange={(v) => save.mutate({ id: r.id, patch: { is_assessable: v } })}
                      />
                    </label>

                    <div className="ml-auto flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0}
                        onClick={() => move(r, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === plan.length - 1}
                        onClick={() => move(r, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                        onClick={() => removeRow.mutate(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <StageTopics stageId={r.id} />
                  </div>
                );
              })}

              {plan.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing in this Journey yet.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              <Input
                placeholder="New stage title…"
                className="h-8 w-56"
                onKeyDown={(e) => {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (e.key === 'Enter' && v) {
                    addStage.mutate(v);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">press Enter to add</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JourneyManager;
