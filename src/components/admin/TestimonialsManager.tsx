import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2, Star } from 'lucide-react';
import { testimonialConfig } from '@/adapters/testimonialConfig';
import { EntityFormDialog } from './EntityFormDialog';
import { useEntityManager } from '@/hooks/useEntityManager';

const TestimonialsManager = () => {
  const { items: testimonials, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(testimonialConfig);

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
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Testimonial
        </Button>
      </div>

      <EntityFormDialog config={testimonialConfig} {...dialog} />

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
                          i < testimonial.rating ? 'text-warning fill-current' : 'text-muted-foreground/30'
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
                  onClick={() => openEdit(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove(testimonial)}
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
