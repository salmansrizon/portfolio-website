import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRepository } from '@/integrations/supabase/repository';
import { projectConfig } from '@/adapters/entityConfigs';
import EntityFormDialog from './EntityFormDialog';

const projectRepository = createRepository(projectConfig);

const ProjectManager = () => {
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects = [], isLoading: loading } = projectRepository.useFindAll();
  const { mutate: deleteProject } = projectRepository.useDelete();
  const { mutate: createProject } = projectRepository.useCreate();
  const { mutate: updateProject } = projectRepository.useUpdate();

  const handleSave = (formData: any) => {
    if (editingProject) {
      updateProject(
        { id: editingProject.id, item: formData },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Project updated successfully!" });
            setIsDialogOpen(false);
            setEditingProject(null);
          },
          onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to update", variant: "destructive" }),
        }
      );
    } else {
      createProject(formData, {
        onSuccess: () => {
          toast({ title: "Success", description: "Project created successfully!" });
          setIsDialogOpen(false);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    deleteProject(id, {
      onSuccess: () => toast({ title: "Success", description: "Project deleted successfully!" }),
      onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to delete", variant: "destructive" }),
    });
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

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
        <Button onClick={handleNewProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <EntityFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        config={projectConfig}
        editingItem={editingProject}
        onSave={handleSave}
        title="Project"
      />

      <div className="grid gap-6">
        {projects.map((project: any) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{project.title}</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(project.id)}>
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
