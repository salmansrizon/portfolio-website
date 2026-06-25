import { z } from 'zod';

// ── Entity config shape ─────────────────────────────────────────────────────
export interface EntityConfig<T extends Record<string, unknown>> {
  table: string;
  primaryKey?: string; // defaults to 'id'
  schema: z.ZodSchema<T>;
  defaultSort?: string;
  realtime?: boolean;
  fields: FormFieldConfig<T>[];
}

// ── Session Type (for booking system) ─────────────────────────────────────
export const sessionTypeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  duration_minutes: z.number().min(1, 'Duration is required'),
  fee: z.number().min(0, 'Fee must be non-negative'),
  is_active: z.boolean().default(true),
  is_paid: z.boolean().default(false),
  created_at: z.string().optional(),
});

export type SessionType = z.infer<typeof sessionTypeSchema>;

export const sessionTypeConfig: EntityConfig<SessionType> = {
  table: 'session_types',
  schema: sessionTypeSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'duration_minutes', type: 'number', label: 'Duration (minutes)', required: true },
    { name: 'fee', type: 'number', label: 'Fee', required: true },
    { name: 'is_active', type: 'boolean', label: 'Active' },
    { name: 'is_paid', type: 'boolean', label: 'Paid Session' },
  ],
};

// ── Payment Settings ──────────────────────────────────────────────
export const paymentSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  bkash_number: z.string().nullable().optional(),
  nagad_number: z.string().nullable().optional(),
  bkash_qr_code: z.string().nullable().optional(),
  nagad_qr_code: z.string().nullable().optional(),
  payment_window_minutes: z.number().default(30),
  additional_instructions: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export const paymentSettingsConfig: EntityConfig<PaymentSettings> = {
  table: 'payment_settings',
  schema: paymentSettingsSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'bkash_number', type: 'text', label: 'bKash Number' },
    { name: 'nagad_number', type: 'text', label: 'Nagad Number' },
    { name: 'payment_window_minutes', type: 'number', label: 'Payment Window (minutes)' },
  ],
};

// ── Unavailable Slot ──────────────────────────────────────────────
export const unavailableSlotSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().min(1, 'Date is required'),
  time_slot: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type UnavailableSlot = z.infer<typeof unavailableSlotSchema>;

export const unavailableSlotConfig: EntityConfig<UnavailableSlot> = {
  table: 'unavailable_slots',
  schema: unavailableSlotSchema,
  defaultSort: 'date',
  realtime: false,
  fields: [
    { name: 'date', type: 'text', label: 'Date', required: true },
    { name: 'time_slot', type: 'text', label: 'Time Slot' },
  ],
};

// ── Availability Settings ─────────────────────────────────────────
export const availabilitySettingsSchema = z.object({
  id: z.string().uuid().optional(),
  available_weekdays: z.array(z.number()).default([1, 2, 3, 4, 5]),
  time_slots: z.array(z.string()).default([]),
  created_at: z.string().optional(),
});

export type AvailabilitySettings = z.infer<typeof availabilitySettingsSchema>;

export const availabilitySettingsConfig: EntityConfig<AvailabilitySettings> = {
  table: 'availability_settings',
  schema: availabilitySettingsSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'available_weekdays', type: 'array', label: 'Available Weekdays' },
    { name: 'time_slots', type: 'array', label: 'Time Slots' },
  ],
};

// ── Career Prep Question ─────────────────────────────────────────────────
export const careerPrepQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  industry: z.string().min(1, 'Industry is required'),
  content_md: z.string(),
  schema_sql: z.string().optional(),
  initial_sql: z.string().optional(),
  solution_sql: z.string(),
  success_rate: z.number().default(0),
  hints: z.array(z.string()).optional(),
  question_type: z.enum(['root', 'code', 'mcq', 'case_study']).default('code'),
  parent_id: z.string().uuid().nullable().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  time_limit_secs: z.number().nullable().optional(),
  order_index: z.number().default(0),
  weight: z.number().default(1),
  options: z.array(z.object({
    label: z.string(),
    text: z.string(),
  })).optional(),
  correct_option: z.string().optional(),
  created_at: z.string().optional(),
});

export type CareerPrepQuestion = z.infer<typeof careerPrepQuestionSchema>;

export const careerPrepQuestionConfig: EntityConfig<CareerPrepQuestion> = {
  table: 'careerprep_questions',
  schema: careerPrepQuestionSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true },
    { name: 'difficulty', type: 'select', label: 'Difficulty', options: [
      { label: 'Easy', value: 'Easy' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Hard', value: 'Hard' },
    ]},
    { name: 'industry', type: 'text', label: 'Industry', required: true },
    { name: 'content_md', type: 'textarea', label: 'Content (Markdown)' },
    { name: 'solution_sql', type: 'textarea', label: 'Solution SQL' },
    { name: 'question_type', type: 'select', label: 'Question Type', options: [
      { label: 'Root', value: 'root' },
      { label: 'Code', value: 'code' },
      { label: 'MCQ', value: 'mcq' },
      { label: 'Case Study', value: 'case_study' },
    ]},
  ],
};

export interface FormFieldConfig<T extends Record<string, unknown>> {
  name: keyof T;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[]; // for 'select'
  required?: boolean;
}

// ── Project ──────────────────────────────────────────────────────────────────
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).default([]),
  image_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  created_at: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;

export const projectConfig: EntityConfig<Project> = {
  table: 'projects',
  schema: projectSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description', required: true },
    { name: 'technologies', type: 'array', label: 'Technologies' },
    { name: 'image_url', type: 'text', label: 'Image URL' },
    { name: 'demo_url', type: 'text', label: 'Demo URL' },
    { name: 'github_url', type: 'text', label: 'GitHub URL' },
  ],
};

// ── Service ──────────────────────────────────────────────────────────────────
export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  features: z.array(z.string()).default([]),
  icon: z.string().optional(),
  created_at: z.string().optional(),
});

export type Service = z.infer<typeof serviceSchema>;

export const serviceConfig: EntityConfig<Service> = {
  table: 'services',
  schema: serviceSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description', required: true },
    { name: 'features', type: 'array', label: 'Features' },
    { name: 'icon', type: 'text', label: 'Icon' },
  ],
};

// ── Testimonial ──────────────────────────────────────────────────────────────
export const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  client_name: z.string().min(1, 'Client name is required'),
  company: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).optional(),
  created_at: z.string().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

export const testimonialConfig: EntityConfig<Testimonial> = {
  table: 'testimonials',
  schema: testimonialSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'client_name', type: 'text', label: 'Client Name', required: true },
    { name: 'company', type: 'text', label: 'Company' },
    { name: 'content', type: 'textarea', label: 'Content', required: true },
    { name: 'rating', type: 'number', label: 'Rating (1-5)' },
  ],
};

// ── Certification ────────────────────────────────────────────────────────────
export const certificationSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  credential_id: z.string().optional(),
  verification_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  earned_date: z.string().optional(),
  created_at: z.string().optional(),
});

export type Certification = z.infer<typeof certificationSchema>;

export const certificationConfig: EntityConfig<Certification> = {
  table: 'certifications',
  schema: certificationSchema,
  defaultSort: 'earned_date',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'issuer', type: 'text', label: 'Issuer', required: true },
    { name: 'credential_id', type: 'text', label: 'Credential ID' },
    { name: 'verification_url', type: 'text', label: 'Verification URL' },
    { name: 'image_url', type: 'text', label: 'Image URL' },
    { name: 'earned_date', type: 'text', label: 'Earned Date' },
  ],
};

// ── Blog Post ──────────────────────────────────────────────────────
export const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogPostConfig: EntityConfig<BlogPost> = {
  table: 'blogs',
  schema: blogPostSchema,
  defaultSort: 'created_at',
  realtime: true, // Enable realtime for admin
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
    { name: 'content', type: 'textarea', label: 'Content', required: true },
    { name: 'cover_image_url', type: 'text', label: 'Cover Image URL' },
    { name: 'published', type: 'boolean', label: 'Published' },
    { name: 'categories', type: 'array', label: 'Categories' },
  ],
};
