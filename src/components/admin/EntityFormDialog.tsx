import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityConfig } from '@/adapters/entityConfigs';
import { useEntityForm, buildDefaultValues, isNullableField } from '@/hooks/useEntityForm';
import { ImageUploadField } from './ImageUploadField';

// Radix Select.Item can't have value="" — a nullable field's "no selection"
// state is represented by this sentinel instead, and translated to/from null
// at the edges (never leaks into the submitted data).
const NONE_VALUE = '__none__';

interface EntityFormDialogProps<T extends Record<string, unknown>> {
  config: EntityConfig<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: T | null;
  onSubmit: (formData: Partial<T>) => void;
  // Options for 'select'/'multiselect' fields that come from sibling data the
  // Manager already has loaded (e.g. other rows, a related table) rather than
  // a static list — keyed by field name, overrides config.fields[].options.
  dynamicOptions?: Partial<Record<keyof T, { label: string; value: string }[]>>;
}

export function EntityFormDialog<T extends Record<string, unknown>>({
  config,
  open,
  onOpenChange,
  initialData,
  onSubmit,
  dynamicOptions,
}: EntityFormDialogProps<T>) {
  const isEdit = !!initialData;
  const form = useEntityForm({ config, defaultValues: initialData });
  const { register, control, formState: { errors } } = form.methods;

  // Managers keep one EntityFormDialog mounted and just toggle open/initialData,
  // so defaultValues set once at useForm() init isn't enough — reset whenever
  // the dialog is about to show a (possibly different) item.
  useEffect(() => {
    if (open) form.methods.reset(buildDefaultValues(config, initialData) as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data as Partial<T>);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Add'} {config.entityLabel}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => {
            const fieldName = field.name as string;
            const error = (errors as Record<string, { message?: string }>)[fieldName];

            return (
              <div key={fieldName} className="space-y-1.5">
                <Label htmlFor={fieldName}>{field.label}</Label>

                {field.type === 'select' ? (
                  <Controller
                    control={control}
                    name={field.name as any}
                    render={({ field: f }) => {
                      const opts = dynamicOptions?.[field.name] ?? field.options ?? [];
                      const nullable = isNullableField(config, field.name);
                      return (
                        <Select
                          value={f.value ?? (nullable ? NONE_VALUE : '')}
                          onValueChange={(v) => f.onChange(v === NONE_VALUE ? null : v)}
                        >
                          <SelectTrigger id={fieldName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {nullable && <SelectItem value={NONE_VALUE}>None</SelectItem>}
                            {opts.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                ) : field.type === 'multiselect' ? (
                  <Controller
                    control={control}
                    name={field.name as any}
                    render={({ field: f }) => {
                      const opts = dynamicOptions?.[field.name] ?? field.options ?? [];
                      const selected: string[] = f.value ?? [];
                      return (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
                          {opts.length === 0 ? (
                            <p className="col-span-2 text-sm text-muted-foreground">No options available.</p>
                          ) : (
                            opts.map((opt) => {
                              const optionId = `${fieldName}-${opt.value}`;
                              return (
                                <div key={opt.value} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    id={optionId}
                                    checked={selected.includes(opt.value)}
                                    onCheckedChange={(checked) => {
                                      f.onChange(
                                        checked === true
                                          ? [...selected, opt.value]
                                          : selected.filter((v) => v !== opt.value)
                                      );
                                    }}
                                  />
                                  <Label htmlFor={optionId} className="font-normal">{opt.label}</Label>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    }}
                  />
                ) : field.type === 'image' ? (
                  <Controller
                    control={control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <ImageUploadField
                        value={f.value as string | null | undefined}
                        onChange={f.onChange}
                        bucket={field.bucket ?? 'admin-uploads'}
                        pathPrefix={field.pathPrefix}
                        maxWidthOrHeight={field.maxWidthOrHeight}
                        label={field.label}
                      />
                    )}
                  />
                ) : field.type === 'boolean' ? (
                  <Controller
                    control={control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <div>
                        <Switch id={fieldName} checked={!!f.value} onCheckedChange={f.onChange} />
                      </div>
                    )}
                  />
                ) : field.type === 'textarea' || field.type === 'array' ? (
                  <Textarea
                    id={fieldName}
                    rows={field.type === 'array' ? 4 : 5}
                    placeholder={field.type === 'array' ? 'One per line' : field.placeholder}
                    {...register(field.name as any)}
                  />
                ) : (
                  <Input
                    id={fieldName}
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    {...register(field.name as any, field.type === 'number' ? { valueAsNumber: true } : undefined)}
                  />
                )}

                {error?.message && (
                  <p className="text-sm text-destructive">{error.message}</p>
                )}
              </div>
            );
          })}
          <div className="flex justify-end gap-2 pt-2">
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
