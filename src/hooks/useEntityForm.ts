import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EntityConfig, FormFieldConfig } from './entityConfigs';

// ── Generic entity form hook ────────────────────────────────────────────────
// Wraps react-hook-form with Zod validation and field config for UI generation.
//
// Usage:
//   const form = useEntityForm({ config: projectConfig, defaultValues: {...} });
//   // form.fields → the field config array for rendering inputs
//   // form.methods → the react-hook-form methods (register, handleSubmit, etc.)

export function useEntityForm<T extends Record<string, unknown>>({
  config,
  defaultValues,
}: {
  config: EntityConfig<T>;
  defaultValues?: Partial<T>;
}) {
  type FormValues = z.infer<typeof config['schema']>;

  const methods: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(config.schema),
    defaultValues: defaultValues as FormValues,
  });

  return {
    // react-hook-form methods
    methods,
    // field config array for rendering (typed to this entity)
    fields: config.fields,
    // convenience: submit with validation
    handleSubmit: methods.handleSubmit,
    // form state
    isSubmitting: methods.formState.isSubmitting,
    errors: methods.formState.errors,
  };
}
