import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Map, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { roadmapConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import { useEntityManager } from '@/hooks/useEntityManager';

const RoadmapManager = () => {
  const { items: roadmaps, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(roadmapConfig);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Career Roadmaps</h2>
          <p className="text-muted-foreground">Manage career roadmaps with markdown content</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Roadmap</Button>
      </div>

      <div className="grid gap-4">
        {roadmaps.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.description || 'No description'}</p>
                </div>
                <Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <a href={`/roadmaps/${r.slug}`} target="_blank"><Eye className="h-4 w-4" /></a>
                </Button>
                <Button variant="outline" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {roadmaps.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No roadmaps yet. Create one to get started.</p>
        )}
      </div>

      <EntityFormDialog config={roadmapConfig} {...dialog} />
    </div>
  );
};

export default RoadmapManager;
