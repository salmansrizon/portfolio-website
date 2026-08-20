import * as React from 'react';
import { RowSkeleton } from '@/components/ui/skeletons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Lightbulb, Layers } from 'lucide-react';
import { topicConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import ListPager from './ListPager';
import { useEntityManager } from '@/hooks/useEntityManager';

// Flat CRUD over one entity, so it takes the Entity Manager shell. Attaching a
// Topic to a Step or a Question happens where those are already edited — the
// Roadmap Step editor and Career Prep Manager — not on a mapping screen here.


// Sub-topic cards for one Topic. Authored here rather than in a separate tab:
// a section has no life outside its Topic, and a screen for editing rows that
// belong to something else is how admin panels grow to 25 tabs.
const TopicSectionsEditor = ({ topicId }: { topicId: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [takeaway, setTakeaway] = React.useState('');

  const { data: sections = [] } = useQuery({
    queryKey: ['admin-topic-sections', topicId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('topic_sections').select('id, title, body, takeaway, order_index')
        .eq('topic_id', topicId).order('order_index');
      return (data ?? []) as { id: string; title: string; body: string; takeaway: string | null; order_index: number }[];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-topic-sections', topicId] });
  const fail = (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' });

  const add = async () => {
    if (!title.trim() || !body.trim()) return;
    const nextOrder = (sections[sections.length - 1]?.order_index ?? 0) + 1;
    const { error } = await (supabase as any).from('topic_sections').insert({
      topic_id: topicId,
      title: title.trim(),
      body: body.trim(),
      takeaway: takeaway.trim() || null,
      order_index: nextOrder,
    });
    if (error) return fail(error);
    setTitle(''); setBody(''); setTakeaway(''); refresh();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from('topic_sections').delete().eq('id', id);
    if (error) return fail(error);
    refresh();
  };

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Sub-topic cards ({sections.length})
      </p>

      {sections.map((s) => (
        <div key={s.id} className="flex items-start gap-2 rounded-lg border p-2">
          <span className="mt-0.5 text-xs font-bold text-muted-foreground">{s.order_index}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{s.body}</p>
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(s.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <div className="space-y-2 rounded-lg border border-dashed p-3">
        <Input placeholder="Section title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-8" />
        <Textarea placeholder="Body — the mechanism, the decision, or the failure mode" value={body}
          onChange={(e) => setBody(e.target.value)} rows={3} />
        <Input placeholder="One-line takeaway (optional)" value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)} className="h-8" />
        <Button size="sm" className="rounded-full" onClick={add} disabled={!title.trim() || !body.trim()}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add card
        </Button>
      </div>
    </div>
  );
};

const TopicManager = () => {
  const { items: topics, pageItems, pagination, isLoading, openCreate, openEdit, remove, dialog } = useEntityManager(topicConfig);
  // One editor open at a time: the sub-topic card editor is the tallest thing in
  // the panel, and ten of them open at once is not a list any more.
  const [expanded, setExpanded] = React.useState<string | null>(null);

  if (isLoading) return <RowSkeleton count={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Topics</h2>
          <p className="text-xs text-muted-foreground">
            One explanation per idea, reused everywhere it comes up. A draft Topic is invisible to learners.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Topic</Button>
      </div>

      <div className="grid gap-2">
        {pageItems.map((c) => (
          <Card key={c.id as string}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold leading-snug">{c.title as string}</h3>
                  <p className="truncate text-xs text-muted-foreground">{c.analogy as string}</p>
                </div>
                <Badge variant={c.status === 'published' ? 'default' : 'secondary'}>
                  {c.status as string}
                </Badge>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant={expanded === c.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 gap-1 text-[11px]"
                  onClick={() => setExpanded(expanded === c.id ? null : (c.id as string))}
                >
                  <Layers className="h-3.5 w-3.5" /> Cards
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => remove(c)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            {expanded === c.id && (
              <CardContent className="px-3 pb-3 pt-0">
                <TopicSectionsEditor topicId={c.id as string} />
              </CardContent>
            )}
          </Card>
        ))}
        {topics.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No topics yet.</p>
        )}
      </div>

      <ListPager pagination={pagination} label="topics" />


      <EntityFormDialog config={topicConfig} {...dialog} />
    </div>
  );
};

export default TopicManager;
