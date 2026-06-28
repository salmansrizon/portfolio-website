import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRepository } from '@/integrations/supabase/repository';
import { testimonialConfig } from '@/adapters/testimonialConfig';
import EntityFormDialog from './EntityFormDialog';

// Create repository instance for testimonials
const testimonialRepository = createRepository(testimonialConfig);

const TestimonialsManager = () => {
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use repository hooks for data fetching and mutations
  const { data: testimonials = [], isLoading: loading } = testimonialRepository.useFindAll();
  const { mutate: deleteTestimonial, isPending: isDeleting } = testimonialRepository.useDelete();
  const { mutate: createTestimonial } = testimonialRepository.useCreate();
  const { mutate: updateTestimonial } = testimonialRepository.useUpdate();

  const handleSave = (formData: any) => {
    if (editingTestimonial) {
      updateTestimonial(
        { id: editingTestimonial.id, item: formData },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Testimonial updated successfully!",
            });
            setIsDialogOpen(false);
            setEditingTestimonial(null);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update testimonial",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createTestimonial(formData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Testimonial created successfully!",
          });
          setIsDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create testimonial",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    deleteTestimonial(testimonialId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete testimonial",
          variant: "destructive",
        });
      },
    });
  };

  const handleNewTestimonial = () => {
    setEditingTestimonial(null);
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
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <Button onClick={handleNewTestimonial}>
          <Plus className="h-4 w-4 mr-2" />
          New Testimonial
        </Button>
      </div>

      <EntityFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        config={testimonialConfig}
        editingItem={editingTestimonial}
        onSave={handleSave}
        title="Testimonial"
      />

      <div className="grid gap-6">
        {testimonials.map((testimonial: any) => (
          <Card key={testimonial.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">{testimonial.client_name}</CardTitle>
                {testimonial.company && (
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                )}
                {testimonial.rating && (
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
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