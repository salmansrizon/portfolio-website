import { supabase } from "@/integrations/supabase/client";
import type { PaymentModalData } from "@/components/PaymentModal";

// Course persistence module — phase 1. Owns the courses-row insert/update
// and the enrollment write. Sections/contents CRUD stays with CourseManager
// (phase 2, separate issue).

export interface CourseDraft {
  title: string;
  description: string;
  short_description: string;
  price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  is_free: boolean;
  promo_only: boolean;
  status: string;
  difficulty_level: string;
  duration_hours: number | null;
  banner_image: string;
  category_id: string | null;
  technologies: string[];
  learning_outcomes: string[];
  requirements: string[];
  target_audience: string[];
  rating: number;
  student_count: number;
  start_date?: string;
  course_includes: string[];
  instructor_id: string | null;
  faqs: { question: string; answer: string }[];
  what_you_will_learn: { title: string; description: string }[];
  course_type: string;
  video_url: string;
}

/**
 * Inserts or updates the courses row for `draft`. Pass `existingId` to
 * update; omit it to create. Returns the course id either way — sections
 * and contents are the caller's responsibility (phase 2 seam).
 */
export async function saveCourse(draft: CourseDraft, existingId?: string | null): Promise<string> {
  const payload = {
    title: draft.title,
    description: draft.description,
    short_description: draft.short_description,
    price: draft.price,
    discounted_price: draft.discounted_price,
    discount_percentage: draft.discount_percentage,
    is_free: draft.is_free,
    promo_only: draft.promo_only,
    status: draft.status,
    difficulty_level: draft.difficulty_level,
    duration_hours: draft.duration_hours,
    banner_image: draft.banner_image,
    category_id: draft.category_id || null,
    technologies: draft.technologies,
    learning_outcomes: draft.learning_outcomes,
    requirements: draft.requirements,
    target_audience: draft.target_audience,
    rating: draft.rating,
    student_count: draft.student_count,
    start_date: draft.start_date ? new Date(draft.start_date).toISOString() : null,
    course_includes: draft.course_includes,
    instructor_id: draft.instructor_id || null,
    faqs: draft.faqs || [],
    what_you_will_learn: draft.what_you_will_learn || [],
    course_type: draft.course_type || "regular",
    video_url: draft.video_url || null,
  };

  if (existingId) {
    const { error } = await supabase.from("courses").update(payload).eq("id", existingId);
    if (error) throw error;
    return existingId;
  }

  const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
  if (error) throw error;
  if (!data?.id) throw new Error("Missing course id");
  return data.id;
}

export interface EnrollmentCourseContext {
  isFree: boolean;
}

/** Writes an enrollment row and bumps the promo code's usage count, if one was applied. */
export async function enrollStudent(
  courseId: string,
  data: PaymentModalData,
  context: EnrollmentCourseContext,
): Promise<void> {
  const { error } = await (supabase
    .from("course_enrollments")
    .insert({
      course_id: courseId,
      user_name: data.name,
      user_email: data.email,
      whatsapp_number: data.whatsapp,
      profession: data.extras.profession,
      institute_name: data.extras.institute_name,
      payment_method: context.isFree ? "free" : data.paymentMethod,
      transaction_id: context.isFree ? null : data.transactionId,
      promo_code: data.promoCode || null,
      discount_amount: data.discountAmount || null,
    } as any) as any);

  if (error) throw error;

  if (data.promoCode) {
    await (supabase.rpc("increment_promo_code_usage" as any, { code_input: data.promoCode }) as any);
  }
}
