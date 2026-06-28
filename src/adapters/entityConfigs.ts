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
  schema: brandLogoSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'logo_url', type: 'text', label: 'Logo URL' },
    { name: 'website_url', type: 'text', label: 'Website URL' },
  ],
};

// ── Instructor ──────────────────────────────────────────────────────────────
export const instructorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  created_at: z.string().optional(),
});

export type Instructor = z.infer<typeof instructorSchema>;

export const instructorConfig: EntityConfig<Instructor> = {
  table: 'instructors',
  schema: instructorSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'avatar_url', type: 'text', label: 'Avatar URL' },
  ],
};

// ── Student ──────────────────────────────────────────────────────────────
export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
  created_at: z.string().optional(),
});

export type Student = z.infer<typeof studentSchema>;

export const studentConfig: EntityConfig<Student> = {
  table: 'students',
  schema: studentSchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'text', label: 'Email' },
    { name: 'avatar_url', type: 'text', label: 'Avatar URL' },
  ],
};

// ── Course ──────────────────────────────────────────────────────────────
export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  price: z.number().min(0).optional(),
  is_published: z.boolean().default(false),
  instructor_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
});

export type Course = z.infer<typeof courseSchema>;

export const courseConfig: EntityConfig<Course> = {
  table: 'courses',
  schema: courseSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'thumbnail_url', type: 'text', label: 'Thumbnail URL' },
    { name: 'price', type: 'number', label: 'Price' },
    { name: 'is_published', type: 'boolean', label: 'Published' },
    { name: 'instructor_id', type: 'text', label: 'Instructor ID' },
  ],
};

// ── Course Review ──────────────────────────────────────────────────────────────
export const courseReviewSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  student_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  created_at: z.string().optional(),
});

export type CourseReview = z.infer<typeof courseReviewSchema>;

export const courseReviewConfig: EntityConfig<CourseReview> = {
  table: 'course_reviews',
  schema: courseReviewSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'student_id', type: 'text', label: 'Student ID', required: true },
    { name: 'rating', type: 'number', label: 'Rating (1-5)', required: true },
    { name: 'comment', type: 'textarea', label: 'Comment' },
  ],
};

// ── Course Category ──────────────────────────────────────────────────────────────
export const courseCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  created_at: z.string().optional(),
});

export type CourseCategory = z.infer<typeof courseCategorySchema>;

export const courseCategoryConfig: EntityConfig<CourseCategory> = {
  table: 'course_categories',
  schema: courseCategorySchema,
  defaultSort: 'name',
  realtime: false,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
  ],
};

// ── Course Enrollment ──────────────────────────────────────────────────────────────
export const courseEnrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  student_id: z.string().uuid(),
  enrolled_at: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

export type CourseEnrollment = z.infer<typeof courseEnrollmentSchema>;

export const courseEnrollmentConfig: EntityConfig<CourseEnrollment> = {
  table: 'course_enrollments',
  schema: courseEnrollmentSchema,
  defaultSort: 'enrolled_at',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'student_id', type: 'text', label: 'Student ID', required: true },
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
  student_id: z.string().uuid(),
  booking_date: z.string(),
  booking_time: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
  created_at: z.string().optional(),
});

export type SessionBooking = z.infer<typeof sessionBookingSchema>;

export const sessionBookingConfig: EntityConfig<SessionBooking> = {
  table: 'session_bookings',
  schema: sessionBookingSchema,
  defaultSort: 'booking_date',
  realtime: false,
  fields: [
    { name: 'session_type_id', type: 'text', label: 'Session Type ID', required: true },
    { name: 'student_id', type: 'text', label: 'Student ID', required: true },
    { name: 'booking_date', type: 'text', label: 'Booking Date', required: true },
    { name: 'booking_time', type: 'text', label: 'Booking Time', required: true },
    { name: 'status', type: 'select', label: 'Status', options: [
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
  description: z.string().optional(),
  webinar_date: z.string(),
  webinar_time: z.string(),
  meeting_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  created_at: z.string().optional(),
});

export type Webinar = z.infer<typeof webinarSchema>;

export const webinarConfig: EntityConfig<Webinar> = {
  table: 'webinars',
  schema: webinarSchema,
  defaultSort: 'webinar_date',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'webinar_date', type: 'text', label: 'Webinar Date', required: true },
    { name: 'webinar_time', type: 'text', label: 'Webinar Time', required: true },
    { name: 'meeting_url', type: 'text', label: 'Meeting URL' },
    { name: 'is_published', type: 'boolean', label: 'Published' },
  ],
};

// ── Roadmap ──────────────────────────────────────────────────────────────
export const roadmapSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration_weeks: z.number().optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().optional(),
});

export type Roadmap = z.infer<typeof roadmapSchema>;

export const roadmapConfig: EntityConfig<Roadmap> = {
  table: 'roadmaps',
  schema: roadmapSchema,
  defaultSort: 'created_at',
  realtime: false,
  fields: [
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'duration_weeks', type: 'number', label: 'Duration (weeks)' },
    { name: 'is_published', type: 'boolean', label: 'Published' },
  ],
};

// ── Course Content ──────────────────────────────────────────────────────────────
export const courseContentSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content_type: z.enum(['video', 'text', 'quiz']),
  content_url: z.string().url().optional().or(z.literal('')),
  order_index: z.number().default(0),
  created_at: z.string().optional(),
});

export type CourseContent = z.infer<typeof courseContentSchema>;

export const courseContentConfig: EntityConfig<CourseContent> = {
  table: 'course_contents',
  schema: courseContentSchema,
  defaultSort: 'order_index',
  realtime: false,
  fields: [
    { name: 'course_id', type: 'text', label: 'Course ID', required: true },
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'content_type', type: 'select', label: 'Content Type', options: [
      { label: 'Video', value: 'video' },
      { label: 'Text', value: 'text' },
      { label: 'Quiz', value: 'quiz' },
    ], required: true },
    { name: 'content_url', type: 'text', label: 'Content URL' },
    { name: 'order_index', type: 'number', label: 'Order Index' },
  ],
};
