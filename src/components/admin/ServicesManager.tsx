import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import IconPicker from './IconPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  created_at: string;
}

const ServicesManager = () => {
  const {
    items: services,
    loading,
    saving,
    editingItem: editingService,
    isDialogOpen,
    setIsDialogOpen,
    startCreate,
    startEdit,
    save,
    remove,
  } = useAdminResource<Service>({ table: 'services', orderBy: { column: 'created_at', ascending: false } });
  const { register, handleSubmit, reset, control, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      features: [{ value: '' }]
    }
  });

  const { fields, append, remove: removeFeature } = useFieldArray({
    control,
    name: 'features'
  });

  const onSubmit = async (formData: any) => {
    const serviceData = {
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      features: formData.features.map((f: any) => f.value).filter((f: string) => f.trim() !== '')
    };
    const ok = await save(serviceData);
    if (ok) reset();
  };

  const handleEdit = (service: Service) => {
    startEdit(service);
    setValue('title', service.title);
    setValue('description', service.description);
    setValue('icon', service.icon || '');
    setValue('features', service.features.map(f => ({ value: f })));
  };

  const handleDelete = (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    remove(serviceId);
  };

  const handleNewService = () => {
    startCreate();
    reset({
      title: '',
      description: '',
      icon: '',
      features: [{ value: '' }]
    });
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
        <h3 className="text-lg font-semibold">Services</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewService}>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Create New Service'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder="Service title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: true })}
                  placeholder="Service description"
                  rows={4}
                />
              </div>

              <div>
                <Label>Icon</Label>
                <IconPicker value={watch('icon')} onChange={(name) => setValue('icon', name)} />
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...register(`features.${index}.value` as const)}
                        placeholder="Feature description"
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
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
                  {editingService ? 'Update' : 'Create'} Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{service.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(service)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
