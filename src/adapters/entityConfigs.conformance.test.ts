import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { EntityConfig } from './entityConfigs';
import * as entityConfigs from './entityConfigs';
import { testimonialConfig as standaloneTestimonialConfig } from './testimonialConfig';

// ── Real schema, by hand ─────────────────────────────────────────────────────
// Every Entity Config declares a `table` and a set of fields on the honor
// system — nothing checks either against the database. This is the runtime
// source of truth those declarations are checked against below: one column
// list per real Supabase table, transcribed from the generated
// `Database['public']['Tables']` type in `../integrations/supabase/types.ts`.
//
// Table types have no runtime representation (they erase at compile time,
// and this project doesn't run `tsc` as part of its test or build pipeline),
// so this hand-transcribed copy is what gives the check real teeth in `vitest
// run`. Regenerate it from types.ts whenever the Supabase schema changes.
const TABLE_COLUMNS = {
  session_types: ['id', 'title', 'description', 'duration_minutes', 'fee', 'is_active', 'is_paid', 'created_at', 'updated_at'],
  payment_settings: ['id', 'bkash_number', 'nagad_number', 'bkash_qr_code', 'nagad_qr_code', 'payment_window_minutes', 'additional_instructions', 'updated_at'],
  unavailable_slots: ['id', 'date', 'time_slot', 'reason', 'created_at', 'updated_at'],
  availability_settings: ['id', 'available_weekdays', 'time_slots', 'created_at', 'updated_at'],
  careerprep_questions: ['id', 'title', 'slug', 'difficulty', 'industry', 'content_md', 'schema_sql', 'initial_sql', 'solution_sql', 'success_rate', 'hints', 'question_type', 'parent_id', 'category', 'tags', 'time_limit_secs', 'order_index', 'options', 'correct_option', 'created_at', 'updated_at'],
  projects: ['id', 'title', 'description', 'technologies', 'image_url', 'demo_url', 'github_url', 'link', 'created_at', 'updated_at'],
  services: ['id', 'title', 'description', 'features', 'icon', 'created_at'],
  testimonials: ['id', 'client_name', 'client_role', 'company', 'content', 'testimonial', 'rating', 'avatar_url', 'created_at'],
  certifications: ['id', 'title', 'issuer', 'credential_id', 'verification_url', 'certificate_url', 'image_url', 'earned_date', 'issue_date', 'created_at'],
  blogs: ['id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'banner_url', 'published', 'categories', 'source_type', 'source_url', 'created_at', 'updated_at'],
  brand_logos: ['id', 'name', 'logo_url', 'website_url', 'hover_text', 'is_visible', 'order_index', 'created_at', 'updated_at'],
  instructors: ['id', 'name', 'email', 'bio', 'avatar_url', 'phone', 'specialization', 'linkedin_url', 'website', 'is_active', 'assigned_courses', 'created_at', 'updated_at'],
  students: ['id', 'name', 'email', 'avatar_url', 'bio', 'phone', 'institution', 'is_active', 'enrolled_courses', 'streak', 'xp', 'created_at', 'updated_at'],
  courses: ['id', 'title', 'description', 'short_description', 'banner_image', 'price', 'discounted_price', 'discount_percentage', 'is_free', 'status', 'category_id', 'instructor_id', 'technologies', 'course_includes', 'course_type', 'difficulty_level', 'duration_hours', 'faqs', 'learning_outcomes', 'rating', 'requirements', 'start_date', 'student_count', 'target_audience', 'video_url', 'what_you_will_learn', 'created_at', 'updated_at'],
  course_reviews: ['id', 'course_id', 'student_name', 'student_email', 'rating', 'review_text', 'is_approved', 'created_at'],
  course_categories: ['id', 'name', 'slug', 'parent_id', 'created_at'],
  course_enrollments: ['id', 'course_id', 'user_name', 'user_email', 'whatsapp_number', 'payment_method', 'transaction_id', 'institute_name', 'profession', 'progress', 'enrolled_at', 'status', 'created_at', 'updated_at'],
  session_bookings: ['id', 'session_type_id', 'user_name', 'user_email', 'phone_number', 'whatsapp_number', 'booking_date', 'time_slot', 'payment_method', 'payment_status', 'payment_deadline', 'transaction_id', 'fee_amount', 'booking_status', 'created_at', 'updated_at'],
  webinars: ['id', 'title', 'description', 'webinar_date', 'banner_url', 'is_free', 'price', 'status', 'booked_count', 'content_blocks', 'created_at', 'updated_at'],
  roadmaps: ['id', 'title', 'slug', 'description', 'markdown_content', 'icon', 'banner_image', 'status', 'order_index', 'created_at', 'updated_at'],
  course_content: ['id', 'course_id', 'section_id', 'title', 'description', 'content_type', 'content_category', 'content_data', 'duration_minutes', 'is_free', 'order_index', 'topics', 'created_at', 'updated_at'],
} as const;

type KnownTable = keyof typeof TABLE_COLUMNS;

function fieldsOf(schema: z.ZodTypeAny): string[] {
  const unwrapped = schema instanceof z.ZodEffects ? schema.innerType() : schema;
  if (!(unwrapped instanceof z.ZodObject)) return [];
  return Object.keys(unwrapped.shape);
}

// Every EntityConfig exported anywhere in the adapters layer — this is the
// full set #79 (Entity Manager rollout) and #80 (repository seam deepening)
// are about to lean on.
const allConfigs: Record<string, EntityConfig<any>> = {
  sessionTypeConfig: entityConfigs.sessionTypeConfig,
  paymentSettingsConfig: entityConfigs.paymentSettingsConfig,
  unavailableSlotConfig: entityConfigs.unavailableSlotConfig,
  availabilitySettingsConfig: entityConfigs.availabilitySettingsConfig,
  careerPrepQuestionConfig: entityConfigs.careerPrepQuestionConfig,
  projectConfig: entityConfigs.projectConfig,
  serviceConfig: entityConfigs.serviceConfig,
  'entityConfigs.testimonialConfig': entityConfigs.testimonialConfig,
  certificationConfig: entityConfigs.certificationConfig,
  blogPostConfig: entityConfigs.blogPostConfig,
  brandLogoConfig: entityConfigs.brandLogoConfig,
  instructorConfig: entityConfigs.instructorConfig,
  studentConfig: entityConfigs.studentConfig,
  courseConfig: entityConfigs.courseConfig,
  courseReviewConfig: entityConfigs.courseReviewConfig,
  courseCategoryConfig: entityConfigs.courseCategoryConfig,
  courseEnrollmentConfig: entityConfigs.courseEnrollmentConfig,
  sessionBookingConfig: entityConfigs.sessionBookingConfig,
  webinarConfig: entityConfigs.webinarConfig,
  roadmapConfig: entityConfigs.roadmapConfig,
  courseContentConfig: entityConfigs.courseContentConfig,
  'testimonialConfig.testimonialConfig': standaloneTestimonialConfig,
};

describe('Entity Config conformance', () => {
  it.each(Object.entries(allConfigs))('%s: table is a real table', (_name, config) => {
    expect(Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, config.table)).toBe(true);
  });

  it.each(Object.entries(allConfigs))('%s: schema fields are real columns', (_name, config) => {
    const table = config.table as KnownTable;
    const realColumns: readonly string[] = TABLE_COLUMNS[table] ?? [];
    const declaredFields = fieldsOf(config.schema);

    const unknownFields = declaredFields.filter(f => !realColumns.includes(f));
    expect(unknownFields).toEqual([]);
  });

  it.each(Object.entries(allConfigs))('%s: form fields are real columns', (_name, config) => {
    const table = config.table as KnownTable;
    const realColumns: readonly string[] = TABLE_COLUMNS[table] ?? [];
    const unknownFormFields = config.fields
      .map(f => String(f.name))
      .filter(f => !realColumns.includes(f));

    expect(unknownFormFields).toEqual([]);
  });
});
