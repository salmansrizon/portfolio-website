-- Questions for the twelve SQL Topics.
--
-- Two sources, deliberately:
--
--   1. The existing question bank. SQL is the one thing this platform can
--      actually execute and grade, so real coding practice already exists —
--      roughly 200 questions with categories that map cleanly onto Topics. They
--      are attached rather than rewritten. Capped at five per Topic, easiest
--      first: a page with 42 questions on it is a list, not a lesson.
--
--   2. New MCQ checkpoints, one per Topic. A checkpoint tests whether the idea
--      landed, which is a different question from whether a query runs — and
--      it is the one graded in the database, so it is what closes the Topic.

-- ── Checkpoints ─────────────────────────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, is_generated)
VALUES

('sql-cp-joins', 'A customer total triples after you add a join to orders. What happened?', 'Medium', 'SQL', 'Joins', 'mcq',
 'The customer-level revenue column was correct before the join and is three times too big after it.', '', '', '',
 '[{"label":"A","text":"The join type is wrong — it should be a LEFT JOIN."},
   {"label":"B","text":"Join fan-out: the customer row is repeated once per order, so the customer-level value is summed once per order."},
   {"label":"C","text":"The orders table contains duplicates that must be deleted."},
   {"label":"D","text":"GROUP BY is missing a column."}]'::jsonb, 'B', false),

('sql-cp-groupby', 'COUNT(*) returns 500, COUNT(email) returns 480. What does that tell you?', 'Easy', 'SQL', 'Aggregation', 'mcq',
 'Same table, same query, two counts.', '', '', '',
 '[{"label":"A","text":"20 rows have a NULL email."},
   {"label":"B","text":"20 emails are duplicates."},
   {"label":"C","text":"20 rows were filtered by a WHERE clause."},
   {"label":"D","text":"COUNT(email) ignores rows added today."}]'::jsonb, 'A', false),

('sql-cp-having', 'Which condition belongs in WHERE rather than HAVING?', 'Easy', 'SQL', 'Filtering', 'mcq',
 'Both run, but only one is correct and fast.', '', '', '',
 '[{"label":"A","text":"SUM(amount) > 10000"},
   {"label":"B","text":"COUNT(*) >= 3"},
   {"label":"C","text":"order_date >= ''2026-01-01''"},
   {"label":"D","text":"AVG(rating) < 2"}]'::jsonb, 'C', false),

('sql-cp-null', 'Why does NOT IN (SELECT manager_id FROM staff) sometimes return no rows at all?', 'Hard', 'SQL', 'NULL Semantics', 'mcq',
 'The table clearly has matching rows, and the query returns an empty result.', '', '', '',
 '[{"label":"A","text":"NOT IN requires an index on the subquery column."},
   {"label":"B","text":"One NULL in the subquery makes the comparison unknown for every row, so nothing qualifies."},
   {"label":"C","text":"Subqueries in NOT IN are limited to 1000 rows."},
   {"label":"D","text":"NOT IN cannot be used with a correlated subquery."}]'::jsonb, 'B', false),

('sql-cp-window', 'What makes SUM(x) OVER (ORDER BY d) a running total rather than a grand total?', 'Medium', 'SQL', 'Window Functions', 'mcq',
 'Remove the ORDER BY and the same expression returns one repeated number.', '', '', '',
 '[{"label":"A","text":"ORDER BY sorts the output, so the numbers appear cumulative."},
   {"label":"B","text":"ORDER BY inside OVER() gives the window a default frame ending at the current row."},
   {"label":"C","text":"SUM behaves differently inside a window function."},
   {"label":"D","text":"The database caches the previous row''s result."}]'::jsonb, 'B', false),

('sql-cp-rank', 'Two products tie for second by revenue. Which function gives the third product rank 3?', 'Easy', 'SQL', 'Window Functions', 'mcq',
 'Ranking with a deliberate tie.', '', '', '',
 '[{"label":"A","text":"RANK()"},
   {"label":"B","text":"ROW_NUMBER()"},
   {"label":"C","text":"DENSE_RANK()"},
   {"label":"D","text":"NTILE(3)"}]'::jsonb, 'C', false),

('sql-cp-cte', 'Why can a window function not be used directly in WHERE?', 'Hard', 'SQL', 'Subqueries', 'mcq',
 'You want rows where the rank is 3 or less, and the database refuses.', '', '', '',
 '[{"label":"A","text":"Window functions are evaluated after WHERE, so the value does not exist yet — wrap it in a CTE and filter outside."},
   {"label":"B","text":"Window functions can only appear in ORDER BY."},
   {"label":"C","text":"WHERE cannot reference any function."},
   {"label":"D","text":"It works, but only with an index on the partition column."}]'::jsonb, 'A', false),

('sql-cp-condagg', 'How do you get paid and unpaid totals per month in a single pass?', 'Medium', 'SQL', 'Conditional Aggregation', 'mcq',
 'One result, two measures, one scan of the table.', '', '', '',
 '[{"label":"A","text":"Two queries joined on month."},
   {"label":"B","text":"SUM(CASE WHEN status = ''paid'' THEN amount END) beside SUM(CASE WHEN status <> ''paid'' THEN amount END), grouped by month."},
   {"label":"C","text":"A WHERE clause on status, run twice."},
   {"label":"D","text":"GROUP BY month, status — which is the same thing."}]'::jsonb, 'B', false),

('sql-cp-dates', 'Which date range filter is safe at any time granularity?', 'Medium', 'SQL', 'Date Functions', 'mcq',
 'The column is a timestamp. You want January.', '', '', '',
 '[{"label":"A","text":"ts BETWEEN ''2026-01-01'' AND ''2026-01-31''"},
   {"label":"B","text":"ts <= ''2026-01-31''"},
   {"label":"C","text":"ts >= ''2026-01-01'' AND ts < ''2026-02-01''"},
   {"label":"D","text":"LEFT(ts::text, 7) = ''2026-01''"}]'::jsonb, 'C', false),

('sql-cp-union', 'Two result sets cannot overlap. Which do you use, and why?', 'Easy', 'SQL', 'Set Operations', 'mcq',
 'Online orders and in-store orders, stacked.', '', '', '',
 '[{"label":"A","text":"UNION, because it is the safer default."},
   {"label":"B","text":"UNION ALL, because de-duplication costs a sort or hash over the whole result and finds nothing."},
   {"label":"C","text":"UNION, because UNION ALL loses rows."},
   {"label":"D","text":"Either — they perform identically."}]'::jsonb, 'B', false),

('sql-cp-index', 'Why does an index on created_at not help WHERE date_trunc(''day'', created_at) = ''2026-01-05''?', 'Hard', 'SQL', 'Indexes', 'mcq',
 'The index exists. The plan shows a sequential scan.', '', '', '',
 '[{"label":"A","text":"The index stores the column, not the result of a function applied to it."},
   {"label":"B","text":"date_trunc is not supported by indexes in any engine."},
   {"label":"C","text":"The table is too small for the planner to bother."},
   {"label":"D","text":"Equality comparisons cannot use a B-tree index."}]'::jsonb, 'A', false),

('sql-cp-norm', 'A city column sits beside a postcode that determines it. Which rule does that break?', 'Medium', 'SQL', 'Modelling', 'mcq',
 'Both columns live in the same table, and one is functionally dependent on the other.', '', '', '',
 '[{"label":"A","text":"First normal form — a repeating group."},
   {"label":"B","text":"Second normal form — partial dependency on the key."},
   {"label":"C","text":"Third normal form — a non-key column depending on another non-key column."},
   {"label":"D","text":"None; this is normal and expected."}]'::jsonb, 'C', false)

ON CONFLICT (slug) DO NOTHING;

-- ── Attach the checkpoints ──────────────────────────────────────────────────
WITH m(qslug, tslug) AS (VALUES
  ('sql-cp-joins','joins'), ('sql-cp-groupby','group-by-aggregation'),
  ('sql-cp-having','where-vs-having'), ('sql-cp-null','null-semantics'),
  ('sql-cp-window','window-functions'), ('sql-cp-rank','rank-vs-dense-rank'),
  ('sql-cp-cte','subqueries-and-ctes'), ('sql-cp-condagg','conditional-aggregation'),
  ('sql-cp-dates','dates-in-sql'), ('sql-cp-union','union-vs-union-all'),
  ('sql-cp-index','indexes'), ('sql-cp-norm','normalisation'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'checkpoint', 0
FROM m JOIN public.topics t ON t.slug = m.tslug
       JOIN public.careerprep_questions q ON q.slug = m.qslug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id = t.id AND tq.question_id = q.id);

-- ── Attach real executable practice from the existing bank ──────────────────
-- Five per Topic, easiest first. Generated placeholders and the hidden exam
-- pool are excluded: filler teaches nothing, and exam rows must stay invisible.
WITH map(category, tslug) AS (VALUES
  ('Joins','joins'), ('Aggregation','group-by-aggregation'), ('Filtering','where-vs-having'),
  ('NULL Semantics','null-semantics'), ('Window Functions','window-functions'),
  ('Subqueries','subqueries-and-ctes'), ('Conditional Aggregation','conditional-aggregation'),
  ('Date Functions','dates-in-sql'), ('Date Arithmetic','dates-in-sql'),
  ('Set Operations','union-vs-union-all')
), ranked AS (
  SELECT t.id AS topic_id, q.id AS question_id,
         row_number() OVER (
           PARTITION BY t.id
           ORDER BY CASE q.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, q.title
         ) AS rn
  FROM map
  JOIN public.topics t ON t.slug = map.tslug
  JOIN public.careerprep_questions q
    ON q.category = map.category
   AND q.is_generated IS NOT TRUE
   AND q.is_assessment_only = false
   AND q.question_type IN ('code', 'case_study', 'mcq')
   AND q.parent_id IS NULL
)
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT topic_id, question_id, 'practice', rn
FROM ranked
WHERE rn <= 5
  AND NOT EXISTS (
    SELECT 1 FROM public.topic_questions tq
    WHERE tq.topic_id = ranked.topic_id AND tq.question_id = ranked.question_id
  );

-- Every SQL Topic now has an explanation, sub-topic cards, practice and a
-- checkpoint, so it can be finished. Publish.
UPDATE public.topics SET status = 'published'
WHERE slug IN ('joins','group-by-aggregation','where-vs-having','null-semantics','window-functions',
               'rank-vs-dense-rank','subqueries-and-ctes','conditional-aggregation','dates-in-sql',
               'union-vs-union-all','indexes','normalisation');

SELECT
  (SELECT count(*) FROM public.topic_questions WHERE role = 'checkpoint') AS checkpoints,
  (SELECT count(*) FROM public.topic_questions WHERE role = 'practice')   AS practice,
  (SELECT count(*) FROM public.topics WHERE status = 'published')         AS published_topics;
