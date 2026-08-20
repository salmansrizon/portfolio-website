-- Two SQL case studies. Both are the shape 2026 interviews actually use: a real
-- artefact (a slow query, a wrong dashboard) and a sequence of decisions.

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
VALUES
('cs-slow-query', 'Case: the query that runs for eleven minutes', 'Hard', 'SQL', 'Performance', 'root',
 E'A daily revenue report has crept from 20 seconds to eleven minutes over six months. Nothing about the query changed; the orders table grew from 2 million rows to 40 million.\n\nThe query joins orders to customers, filters on a formatted date, and computes each customer''s share of their region''s revenue using a correlated subquery.\n\nYou have the plan output and one afternoon.',
 '', '', '', NULL, NULL, NULL, 0, false),

('cs-wrong-dashboard', 'Case: the dashboard that disagrees with finance', 'Hard', 'SQL', 'Joins', 'root',
 E'Finance says last month''s revenue was ৳4.2 crore. The dashboard says ৳6.8 crore. Both read the same warehouse.\n\nThe dashboard query joins orders to order_items to apply a category filter, then sums order.total_amount grouped by month. Refunded orders are excluded with a WHERE clause on refunds.refunded_at.\n\nFind the two defects.',
 '', '', '', NULL, NULL, NULL, 0, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, parent_id, order_index, is_generated)
SELECT v.slug, v.title, v.difficulty, 'SQL', v.category, 'mcq', v.content_md, '', '', '',
       v.options::jsonb, v.correct_option, r.id, v.ord, false
FROM (VALUES
  ('cs-slow-query-1','Step 1: read the plan first','Medium','Performance',1,
   'Before changing anything, what does the plan tell you to look for?',
   '[{"label":"A","text":"The total cost number — if it is high, add indexes."},
     {"label":"B","text":"Where actual rows differ wildly from estimated rows, and which node consumes the time."},
     {"label":"C","text":"Whether the query uses CTEs, which are always slower."},
     {"label":"D","text":"The width of the returned columns."}]','B'),

  ('cs-slow-query-2','Step 2: the date filter','Medium','Performance',2,
   'The filter is WHERE to_char(created_at, ''YYYY-MM'') = ''2026-01''. The plan shows a sequential scan despite an index on created_at. Why, and what is the fix?',
   '[{"label":"A","text":"The index is corrupt; rebuild it."},
     {"label":"B","text":"to_char makes the index unusable — rewrite as created_at >= ''2026-01-01'' AND created_at < ''2026-02-01''."},
     {"label":"C","text":"Text comparison is slow — cast to date instead."},
     {"label":"D","text":"Add an index on to_char(created_at) and keep the query as it is."}]','B'),

  ('cs-slow-query-3','Step 3: the correlated subquery','Hard','Performance',3,
   'Regional share is computed by a subquery that re-sums the region for every row. What replaces it?',
   '[{"label":"A","text":"A window function: SUM(amount) OVER (PARTITION BY region), computed once per partition."},
     {"label":"B","text":"A temporary table populated in a prior statement."},
     {"label":"C","text":"A LEFT JOIN to the same table on region."},
     {"label":"D","text":"Nothing — correlated subqueries are optimised automatically."}]','A'),

  ('cs-slow-query-4','Step 4: what you did not do','Medium','Performance',4,
   'Someone suggests adding indexes on every column in the WHERE and JOIN clauses. Why is that the wrong move here?',
   '[{"label":"A","text":"Indexes cannot help joins."},
     {"label":"B","text":"The two real defects were an unusable filter and a per-row subquery; more indexes add write cost without addressing either."},
     {"label":"C","text":"Postgres allows at most four indexes per table."},
     {"label":"D","text":"Indexes would help, but only after a VACUUM FULL."}]','B'),

  ('cs-wrong-dashboard-1','Step 1: why the number is too high','Medium','Joins',1,
   'The dashboard total is 62% above finance. What is the most likely cause given the join to order_items?',
   '[{"label":"A","text":"Refunds are being added rather than subtracted."},
     {"label":"B","text":"Join fan-out: one order row becomes one row per item, so order.total_amount is summed once per item."},
     {"label":"C","text":"The month boundary is off by one day."},
     {"label":"D","text":"Currency conversion is applied twice."}]','B'),

  ('cs-wrong-dashboard-2','Step 2: fixing the fan-out','Medium','Joins',2,
   'You still need the category filter, which only exists on order_items. What is the correct shape?',
   '[{"label":"A","text":"Keep the join and divide the total by the item count."},
     {"label":"B","text":"Use SELECT DISTINCT on the whole query."},
     {"label":"C","text":"Filter with EXISTS against order_items, so no row is duplicated, then sum at order grain."},
     {"label":"D","text":"Sum order_items.line_amount instead and hope it reconciles."}]','C'),

  ('cs-wrong-dashboard-3','Step 3: the second defect','Hard','NULL Semantics',3,
   'Refunds are excluded with LEFT JOIN refunds r ... WHERE r.refunded_at IS NULL, but the report also drops orders that were never refunded at all in some months. What went wrong?',
   '[{"label":"A","text":"Nothing — that condition is correct for a LEFT JOIN."},
     {"label":"B","text":"Another condition on r.* sits in WHERE, which turns the LEFT JOIN into an INNER JOIN and removes unmatched orders."},
     {"label":"C","text":"IS NULL cannot be used on a timestamp."},
     {"label":"D","text":"The refunds table needs an index."}]','B')
) AS v(slug, title, difficulty, category, ord, content_md, options, correct_option)
JOIN public.careerprep_questions r ON r.slug = split_part(v.slug, '-step', 1) OR r.slug = regexp_replace(v.slug, '-[0-9]+$', '')
WHERE NOT EXISTS (SELECT 1 FROM public.careerprep_questions q WHERE q.slug = v.slug);

WITH m(qslug, tslug) AS (VALUES
  ('cs-slow-query','indexes'), ('cs-slow-query','subqueries-and-ctes'), ('cs-slow-query','window-functions'),
  ('cs-wrong-dashboard','joins'), ('cs-wrong-dashboard','null-semantics'), ('cs-wrong-dashboard','group-by-aggregation'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'case_study', 0
FROM m JOIN public.topics t ON t.slug = m.tslug
       JOIN public.careerprep_questions q ON q.slug = m.qslug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id=t.id AND tq.question_id=q.id);

SELECT
  (SELECT count(*) FROM public.careerprep_questions WHERE slug LIKE 'cs-%' AND question_type='root') AS case_studies,
  (SELECT count(*) FROM public.careerprep_questions WHERE slug LIKE 'cs-%' AND parent_id IS NOT NULL) AS steps,
  (SELECT count(*) FROM public.topic_questions WHERE role='case_study') AS attachments;
