import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// A Topic is the unit Career Prep is built from: an explanation, a set of
// practice Questions, and at most one Checkpoint. It is not a Roadmap Step and
// belongs to no Roadmap — see docs/adr/0004-career-prep-does-not-render-roadmaps.md.
//
// Only published Topics are readable at all (RLS), so nothing here filters on
// status: a draft explanation simply does not arrive.

export interface Topic {
  id: string;
  slug: string;
  title: string;
  what_it_is: string;
  why_it_matters: string;
  how_it_works: string;
  analogy: string;
}

export interface TopicQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: string | null;
  question_type: string;
  role: 'practice' | 'checkpoint' | 'case_study';
}

/** A sub-topic card: one facet of the Topic, with no URL and no progress. */
export interface TopicSection {
  id: string;
  title: string;
  body: string;
  takeaway: string | null;
  diagram: string | null;
  order_index: number;
}

/** External further reading. Mostly free, mostly primary sources. */
export interface TopicReference {
  id: string;
  label: string;
  url: string;
  kind: string;
  note: string | null;
  is_free: boolean;
  order_index: number;
}

const TOPIC_COLUMNS = 'id, slug, title, what_it_is, why_it_matters, how_it_works, analogy';

// The paid deeper cut for this Topic, plus the study material and the event.
// Loaded with the Topic because they render on the same page, below the free
// material — never above it.
const TOPIC_OFFERS = `course:courses(id, title, short_description, price, is_free),
                      ebook:ebooks(id, slug, title, description),
                      webinar:webinars(id, title, webinar_date, is_free)`;

export interface TopicOffers {
  course?: { id: string; title: string; short_description: string | null; price: number | null; is_free: boolean } | null;
  ebook?: { id: string; slug: string; title: string; description: string | null } | null;
  webinar?: { id: string; title: string; webinar_date: string | null; is_free: boolean } | null;
}

/** One Topic and its Questions, split into practice and the single Checkpoint. */
export function useTopic(slug?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['topic', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: topic } = await (supabase as any)
        .from('topics').select(`${TOPIC_COLUMNS}, ${TOPIC_OFFERS}`).eq('slug', slug).maybeSingle();
      if (!topic) return null;

      const { data: sections } = await (supabase as any)
        .from('topic_sections')
        .select('id, title, body, takeaway, diagram, order_index')
        .eq('topic_id', topic.id)
        .order('order_index');

      const { data: references } = await (supabase as any)
        .from('topic_references')
        .select('id, label, url, kind, note, is_free, order_index')
        .eq('topic_id', topic.id)
        .order('order_index');

      const { data: rows } = await (supabase as any)
        .from('topic_questions')
        .select('role, order_index, question:careerprep_questions(id, title, slug, difficulty, question_type)')
        .eq('topic_id', topic.id)
        .order('order_index');

      const questions: TopicQuestion[] = ((rows ?? []) as any[])
        .filter((r) => r.question)
        .map((r) => ({ ...r.question, role: r.role }));

      return {
        topic: topic as Topic,
        offers: {
          course: topic.course ?? null,
          ebook: topic.ebook ?? null,
          webinar: topic.webinar ?? null,
        } as TopicOffers,
        sections: (sections ?? []) as TopicSection[],
        references: (references ?? []) as TopicReference[],
        practice: questions.filter((q) => q.role === 'practice'),
        // Applying the idea, rather than recalling it. Kept separate on the page
        // because "work this through" is a different invitation from "test
        // yourself", and burying it in a question list loses that.
        caseStudies: questions.filter((q) => q.role === 'case_study'),
        // At most one, enforced by a partial unique index rather than assumed.
        checkpoint: questions.find((q) => q.role === 'checkpoint') ?? null,
      };
    },
  });

  return { data: data ?? null, loading: isLoading };
}

/** Topics attached to one Question — the workspace tab and Checkpoint failure. */
export function useQuestionTopics(questionId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['topics', 'question', questionId],
    enabled: !!questionId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('topic_questions')
        .select(`topic:topics(${TOPIC_COLUMNS})`)
        .eq('question_id', questionId);
      if (error) return [] as Topic[];
      return ((data ?? []) as { topic: Topic | null }[])
        .map((row) => row.topic)
        .filter((t): t is Topic => t != null);
    },
  });

  return { topics: data ?? [], loading: isLoading };
}

/** Which Topics this learner has passed, for the Stage lists. */
export function useTopicProgress() {
  const { data, isLoading } = useQuery({
    queryKey: ['topic-progress'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('topic_progress').select('topic_id');
      return new Set(((data ?? []) as { topic_id: string }[]).map((r) => r.topic_id));
    },
  });

  return { passed: data ?? new Set<string>(), loading: isLoading };
}

/**
 * Where a Topic sits in the learner's Journey, and what comes next.
 *
 * The order is the Journey's own: Stages in order, Topics in order within each.
 * A learner following an AI Engineering Journey should never be handed a Topic
 * from someone else's plan, so this reads only the enrolled Journey — when the
 * learner is not enrolled, there is no next Topic rather than an arbitrary one.
 */
export function useTopicNavigation(currentSlug?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['topic-nav', currentSlug],
    enabled: !!currentSlug,
    queryFn: async () => {
      const { data: enrolment } = await (supabase as any)
        .from('enrolments')
        .select('journey_id, journey:journeys(id, title, slug)')
        .is('archived_at', null)
        .maybeSingle();
      if (!enrolment) return null;

      const { data: stages } = await (supabase as any)
        .from('journey_stages')
        .select('order_index, title, roadmap:roadmaps(title, slug, status), stage_topics(order_index, topic:topics(id, slug, title))')
        .eq('journey_id', enrolment.journey_id)
        .order('order_index');

      // Flatten to the reading order the learner actually experiences.
      const sequence: { slug: string; title: string; stage: string; roadmap?: { title: string; slug: string; status: string } | null }[] = [];
      for (const stage of (stages ?? []) as any[]) {
        const topics = (stage.stage_topics ?? [])
          .filter((st: any) => st.topic)
          .sort((a: any, b: any) => a.order_index - b.order_index);
        for (const st of topics) {
          sequence.push({ slug: st.topic.slug, title: st.topic.title, stage: stage.title, roadmap: stage.roadmap });
        }
      }

      const index = sequence.findIndex((t) => t.slug === currentSlug);
      const here = index >= 0 ? sequence[index] : null;
      return {
        stage: here?.stage ?? null,
        // Optional wider reading for this stage. Offered after the next Topic,
        // never instead of it: the plan is the product, the Roadmap is context.
        roadmap: here?.roadmap?.status === 'published' ? here.roadmap : null,
        journey: enrolment.journey as { id: string; title: string; slug: string } | null,
        sequence,
        index,
        previous: index > 0 ? sequence[index - 1] : null,
        next: index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null,
      };
    },
  });

  return { nav: data ?? null, loading: isLoading };
}
