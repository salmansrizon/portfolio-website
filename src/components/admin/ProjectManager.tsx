import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  created_at: string;
}

const ProjectManager = () => {
  const {
    items: projects,
    loading,
    saving,
    editingItem: editingProject,
    isDialogOpen,
    setIsDialogOpen,
    startCreate,
    startEdit,
    save,
    remove,
  } = useAdminResource<Project>({ table: 'projects', orderBy: { column: 'created_at', ascending: false } });
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    const projectData = {
      title: formData.title,
      description: formData.description,
      technologies: formData.technologies ? formData.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      image_url: formData.image_url || null,
      demo_url: formData.demo_url || null,
      github_url: formData.github_url || null
    };
    const ok = await save(projectData);
    if (ok) reset();
  };

  const handleEdit = (project: Project) => {
    startEdit(project);
    reset({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      image_url: project.image_url || '',
      demo_url: project.demo_url || '',
      github_url: project.github_url || ''
    });
  };

  const handleDelete = (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    remove(projectId);
  };

  const handleNewProject = () => {
    startCreate();
    reset();
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder="Project title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: true })}
                  placeholder="Project description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  {...register('technologies', { required: true })}
                  placeholder="React, TypeScript, Tailwind (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  {...register('image_url')}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="demo_url">Demo URL</Label>
                <Input
                  id="demo_url"
                  {...register('demo_url')}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  {...register('github_url')}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{project.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager;
