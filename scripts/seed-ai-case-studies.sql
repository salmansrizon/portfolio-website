-- Case studies for the AI Topics: apply the idea instead of recalling it.
--
-- Shape reuses what already exists — a `root` Question whose ordered children
-- are worked through in one sitting, which the Mission runner in the solve
-- workspace already drives. No new entity, no new page.
--
-- Children are MCQ rather than code because PGLite executes SQL and nothing
-- else: there is no grader here for "write the retrieval function". A sequence
-- of decisions on one scenario is the honest interactive form for these Topics,
-- and it happens to be exactly how the interview round runs — you are given a
-- broken system and asked what you check first.
--
-- Order matters inside a case study: each step is the consequence of the last.

-- ── 1. Triaging a RAG system that is confidently wrong ──────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
VALUES
('cs-rag-triage', 'Case: the assistant that answers confidently and wrongly', 'Hard', 'AI', 'AI Engineering', 'root',
 E'A support assistant over 40,000 help-centre chunks has been live for six weeks.\n\nSupport reports that roughly one answer in five is confidently wrong — fluent, plausible, and not what the documentation says. Nothing has been deployed in three weeks. The corpus has grown by about 900 documents in that time.\n\nYou have logs with the query, the retrieved chunk ids and scores, and the final answer. Work through the triage in order.',
 '', '', '', NULL, NULL, NULL, 0, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
SELECT v.slug, v.title, v.difficulty, 'AI', 'AI Engineering', 'mcq', v.content_md, '', '', '',
       v.options::jsonb, v.correct_option, r.id, v.ord, false
FROM (VALUES
  ('cs-rag-triage-1', 'Step 1: what do you look at first?', 'Medium', 1,
   'You have one afternoon and a full trace log. Where do you start?',
   '[{"label":"A","text":"Rewrite the system prompt to be stricter about accuracy."},
     {"label":"B","text":"Take the wrong answers and check whether the correct chunk was retrieved at all."},
     {"label":"C","text":"Switch to a larger model and re-measure."},
     {"label":"D","text":"Increase the number of retrieved chunks from 5 to 20."}]', 'B'),

  ('cs-rag-triage-2', 'Step 2: the chunk was never retrieved', 'Medium', 2,
   'In 80% of the wrong answers, the chunk containing the correct information was not in the top 5 — and in half of those it was not in the top 50 either. What does that rule out?',
   '[{"label":"A","text":"It rules out generation as the primary cause — the model was never given the answer."},
     {"label":"B","text":"It rules out chunking, since chunks clearly exist."},
     {"label":"C","text":"It rules out the embedding model, which is only used at query time."},
     {"label":"D","text":"It rules out the corpus, which has grown normally."}]', 'A'),

  ('cs-rag-triage-3', 'Step 3: why recall fell as the corpus grew', 'Hard', 3,
   'The 900 new documents are release notes: short, highly similar to each other, and full of version numbers. Retrieval for older questions has got worse since they arrived. What is the most likely mechanism?',
   '[{"label":"A","text":"The index needs rebuilding on a schedule or it degrades."},
     {"label":"B","text":"Many near-identical chunks now crowd the top-k, pushing the one relevant older chunk out."},
     {"label":"C","text":"Embedding quality drops as the number of vectors increases."},
     {"label":"D","text":"Cosine similarity is not valid above 30,000 vectors."}]', 'B'),

  ('cs-rag-triage-4', 'Step 4: the fix, in order', 'Hard', 4,
   'You can ship two changes this week. Which pair addresses the diagnosis rather than the symptom?',
   '[{"label":"A","text":"A stricter prompt, and a larger model."},
     {"label":"B","text":"Raise k to 50, and add a note asking the model to be careful."},
     {"label":"C","text":"Hybrid search so version numbers match exactly, plus a reranker to fix ordering of the crowded top-k."},
     {"label":"D","text":"Re-embed the corpus with the same model, and rebuild the index."}]', 'C')
) AS v(slug, title, difficulty, ord, content_md, options, correct_option)
JOIN public.careerprep_questions r ON r.slug = 'cs-rag-triage'
WHERE NOT EXISTS (SELECT 1 FROM public.careerprep_questions q WHERE q.slug = v.slug);

-- ── 2. The bill that tripled ────────────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
VALUES
('cs-cost-blowup', 'Case: the month the bill tripled', 'Medium', 'AI', 'AI Engineering', 'root',
 E'A document assistant costs about $900/month. This month it is $2,700, with traffic up only 20%.\n\nThe only change shipped was raising retrieved chunks from 4 to 10 "to improve answer quality", and answers did get slightly better in an internal review. Finance wants the old number back without losing the quality.',
 '', '', '', NULL, NULL, NULL, 0, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
SELECT v.slug, v.title, v.difficulty, 'AI', 'AI Engineering', 'mcq', v.content_md, '', '', '',
       v.options::jsonb, v.correct_option, r.id, v.ord, false
FROM (VALUES
  ('cs-cost-blowup-1', 'Step 1: where did the money go?', 'Easy', 1,
   'Traffic rose 20% and cost rose 200%. What explains the gap?',
   '[{"label":"A","text":"Output tokens grew because answers got longer."},
     {"label":"B","text":"Input tokens grew: 4 to 10 chunks is roughly 2.5x the context on every single call."},
     {"label":"C","text":"Embedding costs scale with query volume."},
     {"label":"D","text":"The provider raised prices mid-month."}]', 'B'),

  ('cs-cost-blowup-2', 'Step 2: keeping the quality, losing the cost', 'Medium', 2,
   'The quality gain came from the right chunk being present more often. Which change keeps that and cuts context?',
   '[{"label":"A","text":"Retrieve 20 candidates, rerank, and pass the top 4 to the model."},
     {"label":"B","text":"Go back to 4 chunks and accept the quality loss."},
     {"label":"C","text":"Keep 10 chunks but truncate each to half its length."},
     {"label":"D","text":"Switch to a cheaper model at 10 chunks."}]', 'A'),

  ('cs-cost-blowup-3', 'Step 3: the second lever', 'Medium', 3,
   'Analysis shows 30% of questions this month were near-duplicates of an earlier question. What is the right response, and its risk?',
   '[{"label":"A","text":"Semantic caching — large saving, with the risk of serving a stale answer when the corpus changes."},
     {"label":"B","text":"Prompt caching — it de-duplicates the retrieved chunks automatically."},
     {"label":"C","text":"Rate limiting, so repeat questions are refused."},
     {"label":"D","text":"Lower the temperature so repeated questions cost less."}]', 'A')
) AS v(slug, title, difficulty, ord, content_md, options, correct_option)
JOIN public.careerprep_questions r ON r.slug = 'cs-cost-blowup'
WHERE NOT EXISTS (SELECT 1 FROM public.careerprep_questions q WHERE q.slug = v.slug);

-- ── 3. The agent that charged twice ─────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
VALUES
('cs-agent-incident', 'Case: the agent that charged a customer twice', 'Hard', 'AI', 'AI Engineering', 'root',
 E'A billing assistant can look up an invoice, issue a refund, and charge a card. Yesterday a customer was charged twice for one order.\n\nThe trace shows the charge tool was called, the call timed out at the gateway, the agent saw an error, and the agent called the charge tool again. The gateway had in fact processed the first charge.',
 '', '', '', NULL, NULL, NULL, 0, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
SELECT v.slug, v.title, v.difficulty, 'AI', 'AI Engineering', 'mcq', v.content_md, '', '', '',
       v.options::jsonb, v.correct_option, r.id, v.ord, false
FROM (VALUES
  ('cs-agent-incident-1', 'Step 1: whose bug is this?', 'Medium', 1,
   'The model behaved reasonably: an action failed, so it retried. Where does the defect actually sit?',
   '[{"label":"A","text":"In the model — it should know not to retry payments."},
     {"label":"B","text":"In the tool: a charge that can be executed twice with the same effect is not safe to expose to a retrying caller."},
     {"label":"C","text":"In the gateway, for timing out."},
     {"label":"D","text":"In the prompt, which did not forbid retries."}]', 'B'),

  ('cs-agent-incident-2', 'Step 2: the fix', 'Medium', 2,
   'Which change makes the retry harmless?',
   '[{"label":"A","text":"Lower the temperature so the agent is more deterministic."},
     {"label":"B","text":"Remove the charge tool and have a human perform charges."},
     {"label":"C","text":"An idempotency key per order, so a repeat call with the same key returns the original result instead of charging again."},
     {"label":"D","text":"Increase the gateway timeout."}]', 'C'),

  ('cs-agent-incident-3', 'Step 3: what else to add', 'Hard', 3,
   'Beyond idempotency, which control most reduces the blast radius of this class of incident?',
   '[{"label":"A","text":"A step limit plus authorisation of every tool call against the actual signed-in user."},
     {"label":"B","text":"A larger model with better reasoning."},
     {"label":"C","text":"More few-shot examples of correct billing conversations."},
     {"label":"D","text":"Splitting the work across three specialised agents."}]', 'A')
) AS v(slug, title, difficulty, ord, content_md, options, correct_option)
JOIN public.careerprep_questions r ON r.slug = 'cs-agent-incident'
WHERE NOT EXISTS (SELECT 1 FROM public.careerprep_questions q WHERE q.slug = v.slug);

-- ── Attach the case studies to their Topics ─────────────────────────────────
WITH m(qslug, tslug) AS (VALUES
  ('cs-rag-triage','retrieval-augmented-generation'),
  ('cs-rag-triage','hallucination-and-grounding'),
  ('cs-rag-triage','hybrid-search-and-query-rewriting'),
  ('cs-cost-blowup','llm-cost-and-latency'),
  ('cs-cost-blowup','rerankers'),
  ('cs-agent-incident','agentic-workflows'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'case_study', 0
FROM m
JOIN public.topics t ON t.slug = m.tslug
JOIN public.careerprep_questions q ON q.slug = m.qslug
WHERE NOT EXISTS (
  SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id = t.id AND tq.question_id = q.id
);

SELECT
  (SELECT count(*) FROM public.careerprep_questions WHERE slug LIKE 'cs-%' AND question_type = 'root') AS case_studies,
  (SELECT count(*) FROM public.careerprep_questions WHERE slug LIKE 'cs-%' AND question_type = 'mcq')  AS steps,
  (SELECT count(*) FROM public.topic_questions WHERE role = 'case_study')                              AS attachments;
