-- MCQs for the AI Engineering Topics, written from the same 2026 interview
-- research the Topics were (see scripts/seed-ai-topics.sql for sources).
--
-- Every question is MCQ-shaped on purpose. PGLite executes SQL and nothing else,
-- so "write the retrieval function" has no grader here; "what breaks first" and
-- "which fix comes first" grade correctly and are what these rounds actually
-- ask. That limit is stated to the learner rather than hidden.
--
-- Wrong options are plausible-but-wrong on purpose — the common misconception,
-- not filler. A distractor nobody would pick teaches nothing and makes the
-- question free.

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md,
   schema_sql, initial_sql, solution_sql, options, correct_option, is_generated)
VALUES

-- ── embeddings-and-vector-search ────────────────────────────────────────────
('ai-q-emb-1', 'You switch embedding models but only re-embed new documents. What happens?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'A running RAG system moves from one embedding model to another. New documents are embedded with the new model; the existing index is left as it is.', '', '', '',
 '[{"label":"A","text":"Nothing — embeddings are a standard format, so old and new vectors are comparable."},
   {"label":"B","text":"Retrieval quality collapses, because distances between vectors from two different models are meaningless."},
   {"label":"C","text":"Only the new documents become unsearchable until the index is rebuilt."},
   {"label":"D","text":"Search gets slower but returns the same results."}]'::jsonb, 'B', false),

('ai-q-emb-2', 'Why do production vector indexes use approximate nearest-neighbour search?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'HNSW and IVF are approximate. Exact search is available and is not what most systems run.', '', '', '',
 '[{"label":"A","text":"Approximate search is more accurate on high-dimensional data."},
   {"label":"B","text":"Exact search cannot handle more than a few thousand vectors at all."},
   {"label":"C","text":"Exact search is linear in the number of vectors, so it trades a little recall for a large speed gain."},
   {"label":"D","text":"Approximate search removes the need for an embedding model."}]'::jsonb, 'C', false),

-- ── prompt-engineering ──────────────────────────────────────────────────────
('ai-q-prompt-1', 'A model follows your format instruction about 70% of the time. What is the cheapest reliable fix?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'The task is right, the output format drifts. No training budget.', '', '', '',
 '[{"label":"A","text":"Add two or three worked examples of the exact output format."},
   {"label":"B","text":"Fine-tune the model on a few thousand examples."},
   {"label":"C","text":"Lower the temperature to zero and accept whatever comes out."},
   {"label":"D","text":"Retry the call until the format happens to be right."}]'::jsonb, 'A', false),

('ai-q-prompt-2', 'When does chain-of-thought prompting help least?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'Chain-of-thought asks the model to reason before answering. It costs tokens and latency on every call.', '', '', '',
 '[{"label":"A","text":"Multi-step arithmetic."},
   {"label":"B","text":"Simple classification into one of three labels."},
   {"label":"C","text":"Questions needing several retrieved facts combined."},
   {"label":"D","text":"Debugging a failing test from a stack trace."}]'::jsonb, 'B', false),

-- ── fine-tuning-vs-rag ──────────────────────────────────────────────────────
('ai-q-ft-1', 'Your product answers questions about a price list that changes weekly. Fine-tune or RAG?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'The answers must be current. The tone is already fine.', '', '', '',
 '[{"label":"A","text":"Fine-tune weekly on the new price list."},
   {"label":"B","text":"RAG — the facts change, and retrieval reads them fresh on every question."},
   {"label":"C","text":"Fine-tune once, then correct mistakes in the system prompt."},
   {"label":"D","text":"Neither; increase the context window and paste the whole catalogue every time."}]'::jsonb, 'B', false),

('ai-q-ft-2', 'What does LoRA actually change during fine-tuning?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'LoRA and QLoRA are the standard way to fine-tune cheaply.', '', '', '',
 '[{"label":"A","text":"Every weight in the model, but at lower precision."},
   {"label":"B","text":"Only the tokeniser, so the model reads domain terms correctly."},
   {"label":"C","text":"A small pair of low-rank adapter matrices, leaving the base weights frozen."},
   {"label":"D","text":"The system prompt, stored inside the model file."}]'::jsonb, 'C', false),

-- ── agentic-workflows ───────────────────────────────────────────────────────
('ai-q-agent-1', 'An agent with a payment tool retries a failed step. What must be true for that to be safe?', 'Hard', 'AI', 'AI Engineering', 'mcq',
 'The loop retries on error. The tool charges a customer.', '', '', '',
 '[{"label":"A","text":"The tool is idempotent, so the same call twice charges once."},
   {"label":"B","text":"The model is instructed not to retry payments."},
   {"label":"C","text":"The retry uses a lower temperature."},
   {"label":"D","text":"The tool is called last in the sequence."}]'::jsonb, 'A', false),

('ai-q-agent-2', 'Why cap the number of steps in an agent loop?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'Every agent framework offers a step or iteration limit.', '', '', '',
 '[{"label":"A","text":"Long loops reduce answer quality by design."},
   {"label":"B","text":"An agent that cannot finish will otherwise loop indefinitely, burning cost and latency with no answer."},
   {"label":"C","text":"Providers reject requests with more than ten tool calls."},
   {"label":"D","text":"It prevents the model from calling the same tool twice."}]'::jsonb, 'B', false),

-- ── practice, spread across the retrieval topics ────────────────────────────
('ai-q-chunk-2', 'Why give chunks 10–20% overlap?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'A common default in production chunking.', '', '', '',
 '[{"label":"A","text":"It increases the number of chunks, which improves recall on any query."},
   {"label":"B","text":"A passage that straddles a boundary would otherwise be incomplete in both chunks."},
   {"label":"C","text":"Embedding models require overlapping inputs."},
   {"label":"D","text":"It reduces storage by de-duplicating text."}]'::jsonb, 'B', false),

('ai-q-hybrid-2', 'Which query is vector search most likely to handle badly on its own?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'One of these is the classic argument for keeping keyword search in the mix.', '', '', '',
 '[{"label":"A","text":"\"how do I cancel my subscription\""},
   {"label":"B","text":"\"what is the refund policy\""},
   {"label":"C","text":"\"error PX-4471 on invoice export\""},
   {"label":"D","text":"\"can I pause my plan for a month\""}]'::jsonb, 'C', false),

('ai-q-rerank-2', 'Why does the reranker run on 20 candidates rather than the whole corpus?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'Cross-encoders score a query and a document together rather than comparing pre-computed vectors.', '', '', '',
 '[{"label":"A","text":"It is far more accurate but far slower, so it is affordable only on a shortlist."},
   {"label":"B","text":"Rerankers can only process twenty documents at a time."},
   {"label":"C","text":"Scoring more documents would overflow the context window."},
   {"label":"D","text":"The corpus is not embedded at rerank time."}]'::jsonb, 'A', false),

('ai-q-halluc-2', 'A model answers confidently when retrieval returned nothing useful. Which prompt change helps most?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'Retrieval is being improved separately. This is about the generation half.', '', '', '',
 '[{"label":"A","text":"Ask the model to be more concise."},
   {"label":"B","text":"Explicitly permit \"I do not know / not in the sources\" as a valid answer, and require citations."},
   {"label":"C","text":"Raise the temperature so the model explores more phrasings."},
   {"label":"D","text":"Move the instruction to the end of the prompt."}]'::jsonb, 'B', false),

('ai-q-eval-2', 'Retrieval recall@5 is 0.9 but answers are still wrong. Where do you look?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'The golden set says the right chunk is coming back nine times in ten.', '', '', '',
 '[{"label":"A","text":"The embedding model — recall is misleading."},
   {"label":"B","text":"The chunking strategy, which recall does not measure."},
   {"label":"C","text":"Generation: the prompt, the ordering of context, or the model, since retrieval is doing its job."},
   {"label":"D","text":"The vector index parameters."}]'::jsonb, 'C', false),

('ai-q-cost-2', 'In a typical RAG call, which side of the token bill is usually larger?', 'Easy', 'AI', 'AI Engineering', 'mcq',
 'Providers bill input and output tokens separately.', '', '', '',
 '[{"label":"A","text":"Output, because generated answers are long."},
   {"label":"B","text":"Input, because retrieved context dominates the prompt."},
   {"label":"C","text":"They are always equal."},
   {"label":"D","text":"Neither — embeddings are the main cost."}]'::jsonb, 'B', false),

('ai-q-ops-2', 'Which signal most often explains falling retrieval quality with no code change?', 'Hard', 'AI', 'AI Engineering', 'mcq',
 'Nothing shipped. Quality complaints rise.', '', '', '',
 '[{"label":"A","text":"Drift in the questions users are asking, away from what the corpus covers."},
   {"label":"B","text":"Vector indexes degrading over time."},
   {"label":"C","text":"Embeddings expiring."},
   {"label":"D","text":"Increased traffic lowering similarity scores."}]'::jsonb, 'A', false),

('ai-q-rag-2', 'What does RAG *not* fix?', 'Medium', 'AI', 'AI Engineering', 'mcq',
 'RAG is reached for often, and sometimes for the wrong problem.', '', '', '',
 '[{"label":"A","text":"Answers about private data the model never saw."},
   {"label":"B","text":"Stale facts."},
   {"label":"C","text":"A model that writes in the wrong tone and format for your product."},
   {"label":"D","text":"Answers that need a citation."}]'::jsonb, 'C', false)

ON CONFLICT (slug) DO NOTHING;

-- ── Attach: one Checkpoint per Topic, the rest practice ─────────────────────
WITH m(qslug, tslug, role) AS (VALUES
  ('ai-q-emb-1','embeddings-and-vector-search','checkpoint'),
  ('ai-q-emb-2','embeddings-and-vector-search','practice'),
  ('ai-q-prompt-1','prompt-engineering','checkpoint'),
  ('ai-q-prompt-2','prompt-engineering','practice'),
  ('ai-q-ft-1','fine-tuning-vs-rag','checkpoint'),
  ('ai-q-ft-2','fine-tuning-vs-rag','practice'),
  ('ai-q-agent-1','agentic-workflows','checkpoint'),
  ('ai-q-agent-2','agentic-workflows','practice'),
  ('ai-q-chunk-2','chunking-strategy','practice'),
  ('ai-q-hybrid-2','hybrid-search-and-query-rewriting','practice'),
  ('ai-q-rerank-2','rerankers','practice'),
  ('ai-q-halluc-2','hallucination-and-grounding','practice'),
  ('ai-q-eval-2','rag-evaluation','practice'),
  ('ai-q-cost-2','llm-cost-and-latency','practice'),
  ('ai-q-ops-2','llmops-and-monitoring','practice'),
  ('ai-q-rag-2','retrieval-augmented-generation','practice'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, m.role, 1
FROM m
JOIN public.topics t ON t.slug = m.tslug
JOIN public.careerprep_questions q ON q.slug = m.qslug
WHERE NOT EXISTS (
  SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id = t.id AND tq.question_id = q.id
);

-- Every AI Topic now has an explanation, practice and a Checkpoint, so it can
-- actually be completed. Publish them.
UPDATE public.topics SET status = 'published'
WHERE slug IN (
  'retrieval-augmented-generation','embeddings-and-vector-search','chunking-strategy',
  'hybrid-search-and-query-rewriting','rerankers','hallucination-and-grounding',
  'rag-evaluation','prompt-engineering','fine-tuning-vs-rag','llm-cost-and-latency',
  'agentic-workflows','llmops-and-monitoring');
