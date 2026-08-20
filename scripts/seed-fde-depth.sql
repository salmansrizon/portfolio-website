-- Sub-topic cards, checkpoints and a case study for the Forward Deployed
-- Engineer Topics — same treatment as every other Topic on the platform.

INSERT INTO public.topic_sections (topic_id, title, body, takeaway, order_index)
SELECT t.id, v.title, v.body, v.takeaway, v.ord
FROM (VALUES
('fde-role-shape',1,'FDE, solutions engineer, consultant',
 'A solutions engineer supports a sale and hands over at signature. A consultant advises and leaves a document. An FDE writes production code that stays, and is measured on whether the customer gets value — which is why the role reports into engineering almost everywhere it exists.',
 'If nobody ships code that survives your departure, it is not this job.'),
('fde-role-shape',2,'The feedback loop back to product',
 'The second half of the job is bringing what you learned back. One customer''s workaround, seen three times, is a missing product feature — and the FDE is the only person who has seen all three.',
 'Your bug reports are the product roadmap. Write them like it.'),

('fde-discovery-and-scoping',1,'Ask about the work, not about the AI',
 'People describe the system they imagine, not the task they do. Ask them to walk through the last time they did it, with the actual screens and the actual exceptions. The exceptions are where the requirements live.',
 '"Show me the last one you did" beats any requirements meeting.'),
('fde-discovery-and-scoping',2,'The metric has to pre-date the build',
 'Agree the number and how it is measured before writing code — handling time, first-pass accuracy, tickets deflected. Afterwards, every measurement looks like an excuse, and a project without a baseline can never prove it worked.',
 'No baseline, no proof. Take the measurement in week one.'),

('fde-legacy-integration',1,'Auth is the critical path',
 'Access approval takes weeks in regulated organisations and blocks everything downstream. Start it on day one, in parallel with everything else, and know exactly which team signs it off.',
 'Request credentials before you write the first line. It is always the long pole.'),
('fde-legacy-integration',2,'Adapters and blast radius',
 'Every external system gets a thin adapter with a timeout, a retry policy and a defined failure behaviour. Without it, one slow endpoint takes the whole feature down and the incident is filed against you.',
 'Their outage should degrade one feature, not yours.'),

('fde-messy-data',1,'Profile first, and read by hand',
 'Automated profiling gives nulls, cardinality and formats. Reading a hundred rows yourself gives the conventions — the "N/A" that means pending, the branch that puts two values in one field. Both are necessary.',
 'An hour reading real rows saves a week of confident wrongness.'),
('fde-messy-data',2,'Cleaning is code, not prompt text',
 'Fixes buried in a prompt are invisible, untestable and silently version-dependent. The same rule in a transformation step is reviewable, has a test, and explains itself to whoever inherits it.',
 'If a rule matters, it belongs in code with a test beside it.'),

('fde-permissions-and-tenancy',1,'Filter at retrieval, never after generation',
 'Once a chunk is in the prompt, it has been disclosed — a post-hoc filter on the answer is theatre. Permission attributes belong in chunk metadata so the entitlement check is part of the query.',
 'The permission check happens before retrieval or it has not happened.'),
('fde-permissions-and-tenancy',2,'Test as the least-privileged user',
 'Everything works as an admin, which proves nothing. The test account that matters is the intern with access to one folder, and the assertion is what they cannot see.',
 'Prove the negative: what does the restricted account fail to retrieve?'),

('fde-latency-and-reliability',1,'Budget the hops',
 'Write the latency budget as a table — auth, source fetch, retrieval, rerank, model, glue — and measure each. The slow hop is rarely the model, and without the table the argument becomes a matter of opinion.',
 'You cannot defend a latency number you have not decomposed.'),
('fde-latency-and-reliability',2,'Decide what a timeout returns',
 'Every timeout needs a defined response: a partial answer, a cached one, or an honest failure with a retry. The default — waiting forever — is a decision nobody made and users experience as broken.',
 'A timeout without a fallback is just a slower failure.'),

('fde-demo-to-production',1,'One team, then widen',
 'A pilot with ten committed users produces real usage data and internal advocates. A launch to five hundred produces a support queue and a reputation, in that order.',
 'Depth before breadth. Advocates travel further than announcements.'),
('fde-demo-to-production',2,'Handover starts in week one',
 'Name the owner, write the runbook as you learn it, and train the internal person who will answer questions. Leaving is part of the design, not an event at the end.',
 'Build for the day you are not there. That day is the deliverable.'),

('fde-communicating-tradeoffs',1,'Options with costs, not verdicts',
 'Present two or three paths with what each costs in time, accuracy and risk. The sponsor owns the choice and will defend it; a verdict delivered by an engineer gets relitigated in every later meeting.',
 'Give the decision to the person who owns the consequence.'),
('fde-communicating-tradeoffs',2,'Write the no down',
 'A verbal objection in a busy room did not happen. A short written note — what was asked, why it is risky, what you recommend instead — protects the project and, later, you.',
 'If it is not in writing, you did not raise it.')
) AS v(topic_slug, ord, title, body, takeaway)
JOIN public.topics t ON t.slug = v.topic_slug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_sections s WHERE s.topic_id=t.id AND s.title=v.title);

-- ── Checkpoints ─────────────────────────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, is_generated)
VALUES
('fde-cp-1','A customer asks for "AI in our workflow". What do you do first?','Easy','AI','Forward Deployed','mcq',
 'First week, sponsor is enthusiastic, scope is undefined.','','','',
 '[{"label":"A","text":"Build a demo on their data to show what is possible."},
   {"label":"B","text":"Watch someone do the task and find one repeated decision with a measurable outcome."},
   {"label":"C","text":"Ask which model they would prefer."},
   {"label":"D","text":"Write an architecture document for the full platform."}]'::jsonb,'B',false),

('fde-cp-2','Which work should start on day one because it blocks everything else?','Medium','AI','Forward Deployed','mcq',
 'Ten-week engagement inside a regulated bank.','','','',
 '[{"label":"A","text":"Choosing the vector database."},
   {"label":"B","text":"Access and credentials approval for their systems."},
   {"label":"C","text":"Writing the evaluation harness."},
   {"label":"D","text":"Designing the UI."}]'::jsonb,'B',false),

('fde-cp-3','Where must a permission check happen in a retrieval system?','Hard','AI','Forward Deployed','mcq',
 'Documents have per-team access rules.','','','',
 '[{"label":"A","text":"After generation, by filtering the answer text."},
   {"label":"B","text":"At retrieval, as a condition on chunk metadata — once a chunk is in the prompt it is disclosed."},
   {"label":"C","text":"At login only."},
   {"label":"D","text":"In the system prompt, by instructing the model."}]'::jsonb,'B',false),

('fde-cp-4','A customer field contains "N/A", "-", empty string and NULL. What is the right move?','Medium','AI','Forward Deployed','mcq',
 'Found while profiling before the build.','','','',
 '[{"label":"A","text":"Instruct the model to interpret them sensibly."},
   {"label":"B","text":"Normalise them in an explicit, tested transformation step, after asking the business what each one means."},
   {"label":"C","text":"Drop every row containing them."},
   {"label":"D","text":"Treat them all as zero."}]'::jsonb,'B',false),

('fde-cp-5','Their document API takes 8 seconds under load. Your budget is 3. What do you do?','Hard','AI','Forward Deployed','mcq',
 'You cannot change their API this quarter.','','','',
 '[{"label":"A","text":"Report that the target is impossible and wait."},
   {"label":"B","text":"Cache what is stable, set a timeout with a defined fallback, and stream so first token is fast — then show the sponsor the per-hop budget."},
   {"label":"C","text":"Retry the call until it is fast."},
   {"label":"D","text":"Switch to a smaller model."}]'::jsonb,'B',false),

('fde-cp-6','The pilot team loves it. The sponsor wants an org-wide launch next week. Your answer?','Medium','AI','Forward Deployed','mcq',
 'Ten users, six weeks of usage data, no runbook yet.','','','',
 '[{"label":"A","text":"Agree — momentum matters more than readiness."},
   {"label":"B","text":"Refuse until everything is perfect."},
   {"label":"C","text":"Propose a staged widening with the runbook, named internal owner and usage instrumentation as the conditions, in writing."},
   {"label":"D","text":"Launch and add support later."}]'::jsonb,'C',false),

('fde-cp-7','How do you present a 90%-in-two-weeks versus 97%-in-six-weeks choice?','Medium','AI','Forward Deployed','mcq',
 'The sponsor asks which is better.','','','',
 '[{"label":"A","text":"Recommend 97% — accuracy is what matters."},
   {"label":"B","text":"Give both with their costs and ask what the process needs, so the decision sits with the person who owns the consequence."},
   {"label":"C","text":"Explain the model architecture behind each."},
   {"label":"D","text":"Ask the engineering team to decide."}]'::jsonb,'B',false),

('fde-cp-8','What most distinguishes an FDE from a solutions engineer?','Easy','AI','Forward Deployed','mcq',
 'Both are customer-facing and technical.','','','',
 '[{"label":"A","text":"The FDE writes production code that stays behind and owns the outcome."},
   {"label":"B","text":"The FDE travels more."},
   {"label":"C","text":"The FDE reports into sales."},
   {"label":"D","text":"The FDE only works pre-sale."}]'::jsonb,'A',false)
ON CONFLICT (slug) DO NOTHING;

WITH m(qslug, tslug) AS (VALUES
 ('fde-cp-1','fde-discovery-and-scoping'),('fde-cp-2','fde-legacy-integration'),
 ('fde-cp-3','fde-permissions-and-tenancy'),('fde-cp-4','fde-messy-data'),
 ('fde-cp-5','fde-latency-and-reliability'),('fde-cp-6','fde-demo-to-production'),
 ('fde-cp-7','fde-communicating-tradeoffs'),('fde-cp-8','fde-role-shape'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'checkpoint', 0 FROM m
JOIN public.topics t ON t.slug=m.tslug JOIN public.careerprep_questions q ON q.slug=m.qslug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id=t.id AND tq.question_id=q.id);

-- ── Case study ──────────────────────────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
VALUES
('cs-fde-rollout','Case: week six at the insurance company','Hard','AI','Forward Deployed','root',
 E'You are six weeks into a ten-week deployment at an insurer. The assistant answers policy questions from 200,000 internal documents.\n\nThe pilot team likes it. Three things have surfaced this week: an underwriter saw a document from the claims team they should not have access to; the sponsor wants a launch to 500 staff at the end of the month; and the document API now takes 8 seconds under load, against a 3-second target.\n\nYou have four weeks.',
 '','','',NULL,NULL,NULL,0,false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
SELECT v.slug, v.title, v.difficulty, 'AI', 'Forward Deployed', 'mcq', v.content_md, '','','',
       v.options::jsonb, v.correct_option, r.id, v.ord, false
FROM (VALUES
 ('cs-fde-rollout-1','Step 1: what stops everything else','Hard',1,
  'Three problems, four weeks. Which is handled first and why?',
  '[{"label":"A","text":"Latency — it affects every user on every request."},
    {"label":"B","text":"The permission leak: it is a disclosure of data to someone not entitled to it, and it ends contracts."},
    {"label":"C","text":"The launch date, because the sponsor asked."},
    {"label":"D","text":"All three in parallel, to keep momentum."}]','B'),
 ('cs-fde-rollout-2','Step 2: fixing the leak properly','Hard',2,
  'Retrieval currently searches all chunks and the prompt says to only use documents the user may see. What is the fix?',
  '[{"label":"A","text":"Strengthen the prompt instruction and add a refusal example."},
    {"label":"B","text":"Post-process answers to redact restricted content."},
    {"label":"C","text":"Carry access attributes in chunk metadata and filter at retrieval, then test as a least-privileged user."},
    {"label":"D","text":"Split into two separate assistants per department."}]','C'),
 ('cs-fde-rollout-3','Step 3: the launch conversation','Medium',3,
  'The sponsor still wants 500 users at month end. What do you take into the room?',
  '[{"label":"A","text":"A flat no until all three issues are closed."},
    {"label":"B","text":"Agreement, with overtime to compensate."},
    {"label":"C","text":"A staged plan with conditions — leak fixed and verified, runbook written, named internal owner, usage instrumented — and the cost of each, in writing."},
    {"label":"D","text":"A technical explanation of retrieval filtering."}]','C'),
 ('cs-fde-rollout-4','Step 4: the latency you do not control','Hard',4,
  'Their document API cannot change this quarter. What do you ship?',
  '[{"label":"A","text":"Cache stable documents, timeout with a defined fallback, stream the answer, and show the sponsor a per-hop latency budget naming their API."},
    {"label":"B","text":"Remove retrieval for slow document types."},
    {"label":"C","text":"Increase the timeout to 15 seconds."},
    {"label":"D","text":"Escalate to their infrastructure team and pause the project."}]','A')
) AS v(slug,title,difficulty,ord,content_md,options,correct_option)
JOIN public.careerprep_questions r ON r.slug='cs-fde-rollout'
WHERE NOT EXISTS (SELECT 1 FROM public.careerprep_questions q WHERE q.slug=v.slug);

WITH m(tslug) AS (VALUES ('fde-permissions-and-tenancy'),('fde-demo-to-production'),('fde-latency-and-reliability'),('fde-communicating-tradeoffs'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'case_study', 0 FROM m
JOIN public.topics t ON t.slug=m.tslug
JOIN public.careerprep_questions q ON q.slug='cs-fde-rollout'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id=t.id AND tq.question_id=q.id);

-- Complete, so publish. Offers reuse the AI material: the deployment work sits
-- on top of the same RAG stack, and a half-written FDE course would be worse
-- than pointing at a real one.
UPDATE public.topics SET status='published',
  course_id  = (SELECT id FROM public.courses WHERE title='RAG in Production: Retrieval, Reranking & Evaluation'),
  ebook_id   = (SELECT id FROM public.ebooks WHERE slug='ai-engineering-interview-pack'),
  webinar_id = (SELECT id FROM public.webinars WHERE title='Inside a RAG Interview: what they are really asking')
WHERE slug LIKE 'fde-%';

UPDATE public.journeys SET
  course_id  = (SELECT id FROM public.courses WHERE title='RAG in Production: Retrieval, Reranking & Evaluation'),
  ebook_id   = (SELECT id FROM public.ebooks WHERE slug='ai-engineering-interview-pack'),
  webinar_id = (SELECT id FROM public.webinars WHERE title='Inside a RAG Interview: what they are really asking')
WHERE slug='forward-deployed-engineer';

SELECT (SELECT count(*) FROM public.topics WHERE status='published') AS published_topics,
       (SELECT count(*) FROM public.topic_sections) AS sections,
       (SELECT count(*) FROM public.topic_questions) AS attachments,
       (SELECT count(*) FROM public.careerprep_questions WHERE question_type='root' AND slug LIKE 'cs-%') AS case_studies;
