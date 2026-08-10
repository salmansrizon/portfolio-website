import { z } from 'zod';

// ── Entity config shape ─────────────────────────────────────────────────────
export interface EntityConfig<T extends Record<string, unknown>> {
  table: string;
  primaryKey?: string; // defaults to 'id'
  schema: z.ZodSchema<T>;
  defaultSort?: string;
  realtime?: boolean;
  fields: FormFieldConfig<T>[];
  // Human singular name for toast copy ("{entityLabel} created") and the
  // Entity Form Dialog title ("Add {entityLabel}") — owned by useEntityManager.
  entityLabel: string;
  // Fields useEntityManager's default client-side search matches against
  // (case-insensitive substring, ORed across fields). Omit if the Manager
  // doesn't expose search, or pass a custom searchPredicate for anything
  // beyond a plain per-field substring match (joined/computed data).
  searchableFields?: (keyof T)[];
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
  entityLabel: 'Session Type',
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
  updated_at: z.string().optional(),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export const paymentSettingsConfig: EntityConfig<PaymentSettings> = {
  table: 'payment_settings',
  entityLabel: 'Payment Settings',
  schema: paymentSettingsSchema,
  defaultSort: 'updated_at',
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
  reason: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type UnavailableSlot = z.infer<typeof unavailableSlotSchema>;

export const unavailableSlotConfig: EntityConfig<UnavailableSlot> = {
  table: 'unavailable_slots',
  entityLabel: 'Unavailable Slot',
  schema: unavailableSlotSchema,
  defaultSort: 'date',
  realtime: false,
  fields: [
    { name: 'date', type: 'text', label: 'Date', required: true },
    { name: 'time_slot', type: 'text', label: 'Time Slot' },
    { name: 'reason', type: 'text', label: 'Reason' },
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
  entityLabel: 'Availability Settings',
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
  entityLabel: 'Question',
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
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array' | 'multiselect' | 'image';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[]; // for 'select' / 'multiselect'; overridable at render time via EntityFormDialog's dynamicOptions prop
  required?: boolean;
  bucket?: string; // for 'image' — Supabase Storage bucket to upload into (must already exist, see supabase/migrations)
  pathPrefix?: string; // for 'image' — folder prefix within the bucket
  maxWidthOrHeight?: number; // for 'image' — compression target; omit for the 1920px banner-image default
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
  entityLabel: 'Project',
  schema: projectSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description', required: true },
    { name: 'technologies', type: 'array', label: 'Technologies' },
    { name: 'image_url', type: 'image', label: 'Image URL', bucket: 'admin-uploads', pathPrefix: 'projects' },
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
  entityLabel: 'Service',
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
  entityLabel: 'Certification',
  schema: certificationSchema,
  defaultSort: 'earned_date',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'issuer', type: 'text', label: 'Issuer', required: true },
    { name: 'credential_id', type: 'text', label: 'Credential ID' },
    { name: 'verification_url', type: 'text', label: 'Verification URL' },
    { name: 'image_url', type: 'image', label: 'Image URL', bucket: 'admin-uploads', pathPrefix: 'certifications' },
    { name: 'earned_date', type: 'text', label: 'Earned Date' },
  ],
};

// ── Blog Post ──────────────────────────────────────────────────────
export const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().url().nullable().optional().or(z.literal('')),
  published: z.boolean().nullable().default(false),
  categories: z.array(z.string()).nullable().default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogPostConfig: EntityConfig<BlogPost> = {
  table: 'blogs',
  entityLabel: 'Blog Post',
  schema: blogPostSchema,
  defaultSort: 'created_at',
  realtime: true, // Enable realtime for admin
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true },
    { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
    { name: 'content', type: 'textarea', label: 'Content', required: true },
    { name: 'featured_image', type: 'image', label: 'Featured Image URL', bucket: 'blog-images' },
    { name: 'published', type: 'boolean', label: 'Published' },
    { name: 'categories', type: 'array', label: 'Categories' },
  ],
};

// ── Brand Logo ──────────────────────────────────────────────────────────────
export const brandLogoSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  logo_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  created_at: z.string().optional(),
});

export type BrandLogo = z.infer<typeof brandLogoSchema>;

export const brandLogoConfig: EntityConfig<BrandLogo> = {
  table: 'brand_logos',
  entityLabel: 'Brand Logo',
  schema: brandLogoSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'logo_url', type: 'image', label: 'Logo URL', bucket: 'admin-uploads', pathPrefix: 'logos', maxWidthOrHeight: 800 },
    { name: 'website_url', type: 'text', label: 'Website URL' },
  ],
};

// ── Instructor ──────────────────────────────────────────────────────────────
export const instructorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  linkedin_url: z.string().optional(),
  website: z.string().optional(),
  is_active: z.boolean().default(true),
  assigned_courses: z.array(z.string()).optional(),
  created_at: z.string().optional(),
});

export type Instructor = z.infer<typeof instructorSchema>;

export const instructorConfig: EntityConfig<Instructor> = {
  table: 'instructors',
  entityLabel: 'Instructor',
  schema: instructorSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'text', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Phone' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'specialization', type: 'text', label: 'Specialization' },
    { name: 'avatar_url', type: 'image', label: 'Avatar URL', bucket: 'admin-uploads', pathPrefix: 'instructors', maxWidthOrHeight: 800 },
    { name: 'linkedin_url', type: 'text', label: 'LinkedIn URL' },
    { name: 'website', type: 'text', label: 'Website' },
    { name: 'is_active', type: 'boolean', label: 'Active' },
    { name: 'assigned_courses', type: 'multiselect', label: 'Assigned Courses', options: [] },
  ],
};

// ── Student ──────────────────────────────────────────────────────────────
export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  bio: z.string().nullable().optional(),
  institution: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  enrolled_courses: z.array(z.string()).nullable().optional(),
  streak: z.number().nullable().optional(),
  xp: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Student = z.infer<typeof studentSchema>;

export const studentConfig: EntityConfig<Student> = {
  table: 'students',
  entityLabel: 'Student',
  searchableFields: ['name', 'email'],
  schema: studentSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'text', label: 'Email', required: true },
    { name: 'avatar_url', type: 'image', label: 'Avatar URL', bucket: 'admin-uploads', pathPrefix: 'students', maxWidthOrHeight: 800 },
    { name: 'phone', type: 'text', label: 'Phone' },
    { name: 'institution', type: 'text', label: 'Institution' },
    { name: 'bio', type: 'textarea', label: 'Notes / Bio' },
    { name: 'is_active', type: 'boolean', label: 'Active' },
    { name: 'enrolled_courses', type: 'multiselect', label: 'Enrolled Courses', options: [] },
  ],
};

// ── Course ──────────────────────────────────────────────────────────────
export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().nullable().optional(),
  banner_image: z.string().url().nullable().optional().or(z.literal('')),
  price: z.number().min(0).nullable().optional(),
  discounted_price: z.number().min(0).nullable().optional(),
  discount_percentage: z.number().min(0).nullable().optional(),
  is_free: z.boolean().default(false),
  status: z.string().default('draft'),
  category_id: z.string().uuid().nullable().optional(),
  instructor_id: z.string().uuid().nullable().optional(),
  technologies: z.array(z.string()).default([]),
  created_at: z.string().optional(),
});

export type Course = z.infer<typeof courseSchema>;

export const courseConfig: EntityConfig<Course> = {
  table: 'courses',
  entityLabel: 'Course',
  schema: courseSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description', required: true },
    { name: 'short_description', type: 'textarea', label: 'Short Description' },
    { name: 'banner_image', type: 'image', label: 'Banner Image URL', bucket: 'admin-uploads', pathPrefix: 'courses' },
    { name: 'price', type: 'number', label: 'Price' },
    { name: 'is_free', type: 'boolean', label: 'Free Course' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ]},
    { name: 'instructor_id', type: 'text', label: 'Instructor ID' },
  ],
};

// ── Course Review ──────────────────────────────────────────────────────────────
export const courseReviewSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  student_name: z.string().min(1, 'Student name is required'),
  student_email: z.string().email(),
  rating: z.number().min(1).max(5),
  review_text: z.string().nullable().optional(),
  is_approved: z.boolean().nullable().default(false),
  created_at: z.string().optional(),
});

export type CourseReview = z.infer<typeof courseReviewSchema>;

export const courseReviewConfig: EntityConfig<CourseReview> = {
  table: 'course_reviews',
  entityLabel: 'Review',
  searchableFields: ['student_name', 'student_email', 'review_text'],
  schema: courseReviewSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'student_name', type: 'text', label: 'Student Name', required: true },
    { name: 'student_email', type: 'text', label: 'Student Email', required: true },
    { name: 'rating', type: 'number', label: 'Rating (1-5)', required: true },
    { name: 'review_text', type: 'textarea', label: 'Review' },
    { name: 'is_approved', type: 'boolean', label: 'Approved' },
  ],
};

// ── Course Category ──────────────────────────────────────────────────────────────
export const courseCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parent_id: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
});

export type CourseCategory = z.infer<typeof courseCategorySchema>;

export const courseCategoryConfig: EntityConfig<CourseCategory> = {
  table: 'course_categories',
  entityLabel: 'Category',
  schema: courseCategorySchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true },
    { name: 'parent_id', type: 'select', label: 'Parent Category', options: [] },
  ],
};

// ── Course Enrollment ──────────────────────────────────────────────────────────────
export const courseEnrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  user_name: z.string().min(1, 'Name is required'),
  user_email: z.string().email(),
  whatsapp_number: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  institute_name: z.string().nullable().optional(),
  profession: z.string().nullable().optional(),
  enrolled_at: z.string().optional(),
  status: z.string().default('active'),
});

export type CourseEnrollment = z.infer<typeof courseEnrollmentSchema>;

export const courseEnrollmentConfig: EntityConfig<CourseEnrollment> = {
  table: 'course_enrollments',
  entityLabel: 'Enrollment',
  schema: courseEnrollmentSchema,
  defaultSort: 'enrolled_at',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'user_name', type: 'text', label: 'Name', required: true },
    { name: 'user_email', type: 'text', label: 'Email', required: true },
    { name: 'status', type: 'select', label: 'Status', options: [
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ]},
  ],
};

// ── Session Booking ──────────────────────────────────────────────────────────────
export const sessionBookingSchema = z.object({
  id: z.string().uuid().optional(),
  session_type_id: z.string().uuid(),
  user_name: z.string().min(1, 'Name is required'),
  user_email: z.string().email(),
  phone_number: z.string().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
  booking_date: z.string(),
  time_slot: z.string(),
  payment_method: z.string(),
  payment_status: z.string().default('pending'),
  payment_deadline: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  fee_amount: z.number().default(0),
  booking_status: z.string().default('pending'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SessionBooking = z.infer<typeof sessionBookingSchema>;

export const sessionBookingConfig: EntityConfig<SessionBooking> = {
  table: 'session_bookings',
  entityLabel: 'Booking',
  schema: sessionBookingSchema,
  defaultSort: 'booking_date',
  realtime: false,
  fields: [
    { name: 'session_type_id', type: 'text', label: 'Session Type ID', required: true },
    { name: 'user_name', type: 'text', label: 'Name', required: true },
    { name: 'user_email', type: 'text', label: 'Email', required: true },
    { name: 'phone_number', type: 'text', label: 'Phone Number' },
    { name: 'booking_date', type: 'text', label: 'Booking Date', required: true },
    { name: 'time_slot', type: 'text', label: 'Time Slot', required: true },
    { name: 'payment_method', type: 'text', label: 'Payment Method', required: true },
    { name: 'payment_status', type: 'select', label: 'Payment Status', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Paid', value: 'paid' },
      { label: 'Failed', value: 'failed' },
    ]},
    { name: 'fee_amount', type: 'number', label: 'Fee Amount' },
    { name: 'booking_status', type: 'select', label: 'Booking Status', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'Completed', value: 'completed' },
    ]},
  ],
};

// ── Webinar ──────────────────────────────────────────────────────────────
export const webinarSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  webinar_date: z.string(),
  banner_url: z.string().nullable().optional(),
  is_free: z.boolean().nullable().default(true),
  price: z.number().nullable().optional(),
  status: z.enum(['draft', 'published']).nullable().default('draft'),
  booked_count: z.number().nullable().default(0),
  content_blocks: z.any().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Webinar = z.infer<typeof webinarSchema>;

export const webinarConfig: EntityConfig<Webinar> = {
  table: 'webinars',
  entityLabel: 'Webinar',
  schema: webinarSchema,
  defaultSort: 'webinar_date',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'webinar_date', type: 'text', label: 'Webinar Date', required: true },
    { name: 'banner_url', type: 'text', label: 'Banner URL' },
    { name: 'is_free', type: 'boolean', label: 'Free' },
    { name: 'price', type: 'number', label: 'Price' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ]},
    { name: 'booked_count', type: 'number', label: 'Booked Count' },
  ],
};

// ── Roadmap ──────────────────────────────────────────────────────────────
export const roadmapSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable().optional(),
  markdown_content: z.string().default(''),
  icon: z.string().nullable().optional(),
  banner_image: z.string().nullable().optional(),
  status: z.string().default('draft'),
  order_index: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Roadmap = z.infer<typeof roadmapSchema>;

export const roadmapConfig: EntityConfig<Roadmap> = {
  table: 'roadmaps',
  entityLabel: 'Roadmap',
  schema: roadmapSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'markdown_content', type: 'textarea', label: 'Content' },
    { name: 'icon', type: 'image', label: 'Icon', bucket: 'roadmap-icons', maxWidthOrHeight: 512 },
    { name: 'banner_image', type: 'image', label: 'Banner Image URL', bucket: 'admin-uploads', pathPrefix: 'roadmap-banners' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ]},
    { name: 'order_index', type: 'number', label: 'Order Index' },
  ],
};

// ── Course Content ──────────────────────────────────────────────────────────────
export const courseContentSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  section_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  content_type: z.string().min(1, 'Content type is required'),
  content_category: z.enum(['video', 'text', 'quiz']).nullable().optional(),
  content_data: z.any(),
  duration_minutes: z.number().nullable().optional(),
  is_free: z.boolean().default(false),
  order_index: z.number().default(0),
  topics: z.array(z.string()).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type CourseContent = z.infer<typeof courseContentSchema>;

export const courseContentConfig: EntityConfig<CourseContent> = {
  table: 'course_content',
  entityLabel: 'Content',
  searchableFields: ['title'],
  schema: courseContentSchema,
  defaultSort: 'order_index',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'content_type', type: 'text', label: 'Content Type', required: true },
    { name: 'content_category', type: 'select', label: 'Content Category', options: [
      { label: 'Video', value: 'video' },
      { label: 'Text', value: 'text' },
      { label: 'Quiz', value: 'quiz' },
    ]},
    { name: 'duration_minutes', type: 'number', label: 'Duration (minutes)' },
    { name: 'is_free', type: 'boolean', label: 'Free Content' },
    { name: 'order_index', type: 'number', label: 'Order Index' },
  ],
};
