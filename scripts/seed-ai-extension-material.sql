-- Paid extension for the AI Engineering Journey: four recorded micro-courses,
-- one study pack, one webinar — all SAMPLE CONTENT, written so the experience
-- feels complete end to end and so the real thing has a shape to replace.
--
-- Micro rather than one big course on purpose. A learner who has just finished
-- the rerankers Topic wants more on rerankers; pointing them at a 40-hour
-- bootcamp at that moment is the version of cross-sell that reads as an advert.
-- Each course covers a cluster of Topics and is priced to be an easy yes.
--
-- Every Topic that maps to one is free and complete on its own first. The
-- course is the deeper cut, never the missing half.

-- ── Micro-courses ───────────────────────────────────────────────────────────
INSERT INTO public.courses (title, description, short_description, price, is_free, status, difficulty_level, duration_hours, technologies, course_type)
VALUES
  ('RAG in Production: Retrieval, Reranking & Evaluation',
   'The four rounds a RAG interview actually has, built rather than described: chunking that survives real documents, hybrid retrieval, cross-encoder reranking, and a golden-set evaluation harness you keep using after the course ends. SAMPLE COURSE — replace with real recordings.',
   'Build and measure a RAG system that holds up in production.',
   1490, false, 'published', 'intermediate', 6, ARRAY['RAG','Vector search','Python'], 'recorded'),

  ('Prompt Engineering & Agentic Workflows',
   'From few-shot prompting to tool-calling agents that do not loop forever: prompt structure that survives the thousandth call, ReAct, tool design, argument validation, step limits and idempotency. SAMPLE COURSE — replace with real recordings.',
   'Make an LLM do things reliably, not just describe them.',
   1290, false, 'published', 'intermediate', 5, ARRAY['LLM','Agents','Tool calling'], 'recorded'),

  ('Fine-Tuning LLMs: LoRA, QLoRA and DPO',
   'When fine-tuning is the right answer and when it is an expensive way to avoid writing a prompt. Dataset construction, LoRA and QLoRA adapters, DPO for preferences, and evaluating whether the tuned model is actually better. SAMPLE COURSE — replace with real recordings.',
   'Change how a model behaves, without changing what it knows.',
   1690, false, 'published', 'advanced', 5, ARRAY['Fine-tuning','LoRA','PEFT'], 'recorded'),

  ('LLMOps: Cost, Latency and Monitoring',
   'The work that turns a working prototype into something you can afford to run: token accounting, prompt and semantic caching, model routing, full-trace logging, drift detection and scheduled evaluation. SAMPLE COURSE — replace with real recordings.',
   'Keep an LLM system fast, cheap and observable.',
   1390, false, 'published', 'intermediate', 4, ARRAY['LLMOps','Monitoring','Caching'], 'recorded')
ON CONFLICT DO NOTHING;

-- ── Study material ──────────────────────────────────────────────────────────
INSERT INTO public.ebooks (slug, title, description, storage_path, status)
VALUES
  ('ai-engineering-interview-pack', 'The AI Engineering Interview Pack',
   'Forty questions from the four rounds a 2026 AI engineer loop actually runs — fundamentals, retrieval depth, evaluation, production — with the answer a senior engineer would give and the follow-up they would ask next. SAMPLE — replace with the real PDF.',
   'ebooks/ai-engineering-interview-pack.pdf', 'published')
ON CONFLICT (slug) DO NOTHING;

-- ── Webinar ─────────────────────────────────────────────────────────────────
INSERT INTO public.webinars (title, description, webinar_date, is_free, status)
VALUES
  ('Inside a RAG Interview: what they are really asking',
   'A live walkthrough of the retrieval round — chunking decisions, when a reranker earns its latency, and how to answer an evaluation question without hand-waving. Bring your own system and we will pull it apart. SAMPLE EVENT.',
   now() + interval '21 days', true, 'published')
ON CONFLICT DO NOTHING;

-- ── Map Topics to their deeper cut ──────────────────────────────────────────
UPDATE public.topics t SET course_id = c.id
FROM public.courses c
WHERE c.title = 'RAG in Production: Retrieval, Reranking & Evaluation'
  AND t.slug IN ('retrieval-augmented-generation','chunking-strategy','embeddings-and-vector-search',
                 'hybrid-search-and-query-rewriting','rerankers','hallucination-and-grounding','rag-evaluation');

UPDATE public.topics t SET course_id = c.id
FROM public.courses c
WHERE c.title = 'Prompt Engineering & Agentic Workflows'
  AND t.slug IN ('prompt-engineering','agentic-workflows');

UPDATE public.topics t SET course_id = c.id
FROM public.courses c
WHERE c.title = 'Fine-Tuning LLMs: LoRA, QLoRA and DPO'
  AND t.slug IN ('fine-tuning-vs-rag');

UPDATE public.topics t SET course_id = c.id
FROM public.courses c
WHERE c.title = 'LLMOps: Cost, Latency and Monitoring'
  AND t.slug IN ('llm-cost-and-latency','llmops-and-monitoring');

-- Study material and the webinar are the same for every AI Topic: one pack, one
-- event. Per-Topic ebooks would be twelve half-written PDFs.
UPDATE public.topics t SET ebook_id = e.id, webinar_id = w.id
FROM public.ebooks e, public.webinars w
WHERE e.slug = 'ai-engineering-interview-pack'
  AND w.title = 'Inside a RAG Interview: what they are really asking'
  AND t.slug IN ('retrieval-augmented-generation','chunking-strategy','embeddings-and-vector-search',
                 'hybrid-search-and-query-rewriting','rerankers','hallucination-and-grounding',
                 'rag-evaluation','prompt-engineering','fine-tuning-vs-rag','llm-cost-and-latency',
                 'agentic-workflows','llmops-and-monitoring');

-- Point the AI Engineer Journey's own offers at the AI material rather than the
-- SQL material it inherited.
UPDATE public.journeys j
SET course_id  = (SELECT id FROM public.courses  WHERE title = 'RAG in Production: Retrieval, Reranking & Evaluation'),
    ebook_id   = (SELECT id FROM public.ebooks   WHERE slug  = 'ai-engineering-interview-pack'),
    webinar_id = (SELECT id FROM public.webinars WHERE title = 'Inside a RAG Interview: what they are really asking')
WHERE j.title = 'AI Engineer';

SELECT
  (SELECT count(*) FROM public.topics WHERE course_id IS NOT NULL)  AS topics_with_course,
  (SELECT count(*) FROM public.topics WHERE ebook_id  IS NOT NULL)  AS topics_with_ebook,
  (SELECT count(*) FROM public.courses WHERE course_type = 'recorded') AS micro_courses;
