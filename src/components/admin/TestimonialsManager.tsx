import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Edit, Trash2, Star } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';

interface Testimonial {
  id: string;
  client_name: string;
  company?: string;
  content: string;
  rating?: number;
  created_at: string;
}

const TestimonialsManager = () => {
  const {
    items: testimonials,
    loading,
    saving,
    editingItem: editingTestimonial,
    isDialogOpen,
    setIsDialogOpen,
    startCreate,
    startEdit,
    save,
    remove,
  } = useAdminResource<Testimonial>({ table: 'testimonials', orderBy: { column: 'created_at', ascending: false } });
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const watchedRating = watch('rating');

  const onSubmit = async (formData: any) => {
    const testimonialData = {
      client_name: formData.client_name,
      company: formData.company || null,
      content: formData.content,
      rating: formData.rating ? parseInt(formData.rating) : null
    };
    const ok = await save(testimonialData);
    if (ok) reset();
  };

  const handleEdit = (testimonial: Testimonial) => {
    startEdit(testimonial);
    setValue('client_name', testimonial.client_name);
    setValue('company', testimonial.company || '');
    setValue('content', testimonial.content);
    setValue('rating', testimonial.rating?.toString() || '');
  };

  const handleDelete = (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    remove(testimonialId);
  };

  const handleNewTestimonial = () => {
    startCreate();
    reset();
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-warning fill-current' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
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
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewTestimonial}>
              <Plus className="h-4 w-4 mr-2" />
              New Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    {...register('client_name', { required: true })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Testimonial Content</Label>
                <Textarea
                  id="content"
                  {...register('content', { required: true })}
                  placeholder="Write the testimonial content here..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select onValueChange={(value) => setValue('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                {watchedRating && (
                  <div className="mt-2">
                    {renderStars(parseInt(watchedRating))}
                  </div>
                )}
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
                  {editingTestimonial ? 'Update' : 'Create'} Testimonial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">{testimonial.client_name}</CardTitle>
                {testimonial.company && (
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(testimonial.rating)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
              <p className="text-xs text-muted-foreground mt-2">
                Added: {new Date(testimonial.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsManager;
