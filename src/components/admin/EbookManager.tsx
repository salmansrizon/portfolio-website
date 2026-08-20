import { Button } from '@/components/ui/button';
import { RowSkeleton } from '@/components/ui/skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, BookDown } from 'lucide-react';
import { ebookConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import ListPager from './ListPager';
import { useEntityManager } from '@/hooks/useEntityManager';

// Flat CRUD over one entity, so it takes the Entity Manager shell rather than
// hand-rolling dialog state. Delivery is email-only, so there is no preview link
// here — the send path is what makes an ebook real.

const EbookManager = () => {
  const { items: ebooks, pageItems, pagination, isLoading, openCreate, openEdit, remove, dialog } = useEntityManager(ebookConfig);

  if (isLoading) return <RowSkeleton count={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Ebooks</h2>
          <p className="text-xs text-muted-foreground">
            Lead magnets. A learner submits an email and the file is sent to them.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Ebook</Button>
      </div>

      <div className="grid gap-2">
        {pageItems.map((e) => (
          <Card key={e.id as string}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <BookDown className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold leading-snug">{e.title as string}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {(e.storage_path as string) || 'No file attached yet'}
                  </p>
                </div>
                <Badge variant={e.status === 'published' ? 'default' : 'secondary'}>
                  {e.status as string}
                </Badge>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(e)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => remove(e)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {ebooks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No ebooks yet.</p>
        )}
      </div>

      <ListPager pagination={pagination} label="ebooks" />


      <EntityFormDialog config={ebookConfig} {...dialog} />
    </div>
  );
};

export default EbookManager;
