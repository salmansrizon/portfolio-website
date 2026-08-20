import { z } from 'zod';
import { defineEntityConfig } from './entityConfigs';

// ── Testimonial Schema ─────────────────────────────────────────────────────
export const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  client_name: z.string().min(1, 'Client name is required'),
  company: z.string().nullable().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).nullable().optional(),
  created_at: z.string().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// ── Testimonial Config ──────────────────────────────────────────────────────
export const testimonialConfig = defineEntityConfig<Testimonial>()({
  table: 'testimonials',
  entityLabel: 'Testimonial',
  schema: testimonialSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'client_name', type: 'text', label: 'Client Name', required: true },
    { name: 'company', type: 'text', label: 'Company' },
    { name: 'content', type: 'textarea', label: 'Content', required: true },
    { name: 'rating', type: 'number', label: 'Rating (1-5)' },
  ],
});
