import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EntityConfig } from '@/adapters/entityConfigs';
import { useEntityForm } from '@/hooks/useEntityForm';
import { useFormContext } from 'react-hook-form';

interface EntityFormDialogProps<T = any> {
  config: EntityConfig<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: T;
  onSuccess?: () => void;
}

export function EntityFormDialog<T = any>({
  config,
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: EntityFormDialogProps<T>) {
  const isEdit = !!initialData;
  const form = useEntityForm({ config, defaultValues: initialData });
  const { register, formState: { errors } } = form.methods;

  const onSubmit = form.handleSubmit((data) => {
    // Tracer: just call onSuccess for now
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Add'} {config.table}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          {config.fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  className="w-full border rounded px-3 py-2"
                  {...register(field.name)}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  className="w-full border rounded px-3 py-2"
                  {...register(field.name)}
                />
              ) : field.type === 'checkbox' ? (
                <input
                  id={field.name}
                  type="checkbox"
                  className="h-4 w-4"
                  {...register(field.name)}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  className="w-full border rounded px-3 py-2"
                  {...register(field.name)}
                />
              )}
              {errors[field.name] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[field.name]?.message?.toString()}
                </p>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
