import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { projectConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import { useEntityManager } from '@/hooks/useEntityManager';

const ProjectManager = () => {
  const { items: projects, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(projectConfig);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <EntityFormDialog config={projectConfig} {...dialog} />

      <div className="grid gap-6">
        {projects.map((project: any) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{project.title}</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(project)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(project)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager;
