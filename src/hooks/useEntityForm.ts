import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EntityConfig } from '@/adapters/entityConfigs';

// ── Generic entity form hook ────────────────────────────────────────────────
// Wraps react-hook-form with Zod validation and field config for UI generation.
//
// Usage:
//   const form = useEntityForm({ config: projectConfig, defaultValues: {...} });
//   // form.fields → the field config array for rendering inputs
//   // form.methods → the react-hook-form methods (register, handleSubmit, etc.)

// Array fields (config.fields entry with type: 'array') round-trip through a
// single newline-separated Textarea rather than a chip/add-remove UI — same
// convention CourseManager.tsx already uses for learning_outcomes/requirements/etc.
// zod expects string[]; the textarea's live RHF value is a string. This wraps
// just those fields with a preprocess step so the resolver accepts both, without
// ever mutating config.schema itself (entityConfigs.conformance.test.ts reads
// config.schema.shape directly off the exported configs, so it must stay untouched).
export function buildFormSchema<T extends Record<string, unknown>>(config: EntityConfig<T>) {
  const arrayFields = config.fields.filter(f => f.type === 'array').map(f => f.name);
  if (arrayFields.length === 0) return config.schema;

  const shape = { ...(config.schema as unknown as z.ZodObject<any>).shape };
  for (const name of arrayFields) {
    const fieldSchema = shape[name as string];
    if (!fieldSchema) continue;
    shape[name as string] = z.preprocess((val) => {
      if (typeof val !== 'string') return val;
      return val.split('\n').map(s => s.trim()).filter(Boolean);
    }, fieldSchema);
  }
  return z.object(shape);
}

// Array values need to be displayed as newline-joined text in the textarea,
// otherwise an uncontrolled textarea renders a raw array via Array.toString()
// (comma-joined, no line breaks). Everything else passes through untouched.
//
// Multiselect fields (checkbox grids) stay real string[] throughout — but a
// nullable DB column can arrive as null, and the checkbox grid needs a safe
// array to call .includes() against, so null/undefined coerces to [].
export function buildDefaultValues<T extends Record<string, unknown>>(
  config: EntityConfig<T>,
  values?: Partial<T> | null
) {
  if (!values) return {} as Partial<T>;
  const arrayFieldNames = new Set(config.fields.filter(f => f.type === 'array').map(f => f.name));
  const multiselectFieldNames = new Set(config.fields.filter(f => f.type === 'multiselect').map(f => f.name));
  const result: Record<string, unknown> = { ...values };
  for (const name of arrayFieldNames) {
    const v = result[name as string];
    if (Array.isArray(v)) result[name as string] = v.join('\n');
  }
  for (const name of multiselectFieldNames) {
    if (!Array.isArray(result[name as string])) result[name as string] = [];
  }
  return result as Partial<T>;
}

// Whether a config field's zod type accepts null — used to decide whether a
// 'select' field needs a synthetic "None" option (Radix Select.Item can't
// have value=""). Unwraps ZodOptional/ZodDefault/ZodEffects wrappers looking
// for a ZodNullable anywhere in the chain.
export function isNullableField<T extends Record<string, unknown>>(
  config: EntityConfig<T>,
  fieldName: keyof T
): boolean {
  let schema: any = (config.schema as unknown as z.ZodObject<any>).shape?.[fieldName as string];
  while (schema) {
    if (schema instanceof z.ZodNullable) return true;
    schema = schema._def?.innerType ?? schema._def?.schema;
  }
  return false;
}

export function useEntityForm<T extends Record<string, unknown>>({
  config,
  defaultValues,
}: {
  config: EntityConfig<T>;
  defaultValues?: Partial<T> | null;
}) {
  type FormValues = z.infer<typeof config['schema']>;

  const methods: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(config)),
    defaultValues: buildDefaultValues(config, defaultValues) as FormValues,
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
