-- Sub-topic cards for the twelve SQL Topics.
--
-- Same rule as the AI set: the mechanism, the decision a working analyst faces,
-- and the failure mode that reaches production. Weighted toward what 2026
-- interviews actually test — window functions, CTEs, NULL handling, ties and
-- duplicates, and performance-aware writing — rather than syntax recall.

INSERT INTO public.topic_sections (topic_id, title, body, takeaway, order_index)
SELECT t.id, v.title, v.body, v.takeaway, v.ord
FROM (VALUES

('joins', 1, 'Join fan-out: the silent double-count',
 'Joining a customer to their orders multiplies the customer row once per order. Sum a customer-level column after that join and every value is counted as many times as they have orders. It does not error and the total looks plausible, which is why it survives to a dashboard.',
 'If a total grew after adding a join, you are counting a row more than once.'),

('joins', 2, 'LEFT JOIN plus a WHERE clause on the right table',
 'Filtering the right-hand table in WHERE turns a LEFT JOIN back into an INNER JOIN, because rows where the right side is NULL fail the condition. The fix is to put the condition in the ON clause, where it is applied before the outer join preserves unmatched rows.',
 'Conditions on the outer table belong in ON, not WHERE.'),

('group-by-aggregation', 1, 'COUNT(*) versus COUNT(column) versus COUNT(DISTINCT)',
 'COUNT(*) counts rows. COUNT(column) counts rows where that column is not NULL. COUNT(DISTINCT column) counts unique non-NULL values. Three different numbers from one table, and picking the wrong one is the most common quiet error in a metric.',
 'Decide whether you are counting rows, values, or distinct values — they rarely match.'),

('group-by-aggregation', 2, 'Grouping changes the grain',
 'Every query has a grain: what one row represents. GROUP BY changes it — from one row per order to one row per customer. Bugs cluster where someone forgets the grain changed and joins the result back to something at the old grain.',
 'Name the grain of every result. Most aggregation bugs are grain mismatches.'),

('where-vs-having', 1, 'The order the database actually runs things',
 'FROM and JOIN, then WHERE, then GROUP BY, then HAVING, then SELECT, then ORDER BY. That order explains why a column alias defined in SELECT cannot be used in WHERE, and why an aggregate cannot appear in WHERE — neither exists yet at that point.',
 'Most "why can I not use this here" questions are answered by execution order.'),

('where-vs-having', 2, 'Filter early for speed, not just correctness',
 'A condition in WHERE removes rows before grouping and before any join it can be pushed into, so the database does less work. The same condition in HAVING runs after aggregation. When both are correct, WHERE is the faster one.',
 'When a filter works in either, put it in WHERE.'),

('null-semantics', 1, 'NOT IN with a NULL returns nothing',
 'If the subquery inside NOT IN produces even one NULL, the whole condition evaluates to unknown for every row and the query returns an empty set. NOT EXISTS does not have this behaviour, which is why experienced writers reach for it by default.',
 'Prefer NOT EXISTS. NOT IN plus one NULL silently returns nothing.'),

('null-semantics', 2, 'Aggregates skip NULLs, and that changes averages',
 'AVG over a column with gaps divides by the count of non-NULL values, not the number of rows — so an average over a half-empty column is an average of the half that exists. COALESCE to zero only if zero is genuinely the right value, which for "not measured" it usually is not.',
 'Decide whether a missing value means zero or means unknown. They give different answers.'),

('window-functions', 1, 'Frames: the part everyone skips',
 'ORDER BY inside OVER() gives a default frame of everything from the start of the partition up to the current row — which is exactly what makes a running total work. Change it with ROWS BETWEEN, and understand that the default with ORDER BY is RANGE, which treats tied values as one group.',
 'Running totals work because of the default frame, not because of SUM.'),

('window-functions', 2, 'LAG and LEAD: comparing a row to its neighbour',
 'LAG gives the previous row within the partition, LEAD the next. Month-over-month change, time between a customer''s orders, and detecting gaps in a sequence are all one LAG call and a subtraction, rather than a self-join nobody can read.',
 'If you are self-joining a table to itself on "the previous row", you want LAG.'),

('rank-vs-dense-rank', 1, 'Top-N per group is the interview question',
 'The classic ask is "top 3 products per category". The pattern is a window function partitioned by the group, ranked by the measure, wrapped in a CTE, then filtered to rank <= 3 — because a window function cannot be used in WHERE, for the same execution-order reason as aggregates.',
 'Top-N per group: rank inside a CTE, filter outside it.'),

('rank-vs-dense-rank', 2, 'Deterministic ordering, or the answer changes',
 'With ties and no tiebreaker, ROW_NUMBER assigns positions arbitrarily and the same query can return different rows on different runs. Add a second ORDER BY column that is unique — an id or a timestamp — whenever the result must be reproducible.',
 'Ties without a tiebreaker make a query non-deterministic. Reviewers notice.'),

('subqueries-and-ctes', 1, 'Correlated subqueries run per row',
 'An uncorrelated subquery runs once. A correlated one references the outer row and conceptually runs for each row, which is how a fast query becomes an eleven-minute one. Rewriting it as a join or a window function is the standard fix, and a common interview follow-up.',
 'A subquery that mentions the outer table runs per row. Rewrite it when the table is large.'),

('subqueries-and-ctes', 2, 'CTEs are for readability, and sometimes for materialisation',
 'Chained CTEs let a multi-step calculation read top to bottom. Whether the database materialises a CTE or inlines it differs by engine and version — in Postgres, MATERIALIZED and NOT MATERIALIZED make it explicit. Do not assume a CTE is a performance optimisation; it usually is not.',
 'Write CTEs for the reader. If you need materialisation, say so explicitly.'),

('conditional-aggregation', 1, 'The pivot without a PIVOT keyword',
 'SUM(CASE WHEN month = ''Jan'' THEN amount END) repeated per column turns rows into columns — a pivot table in plain SQL. It is the standard way to build a small crosstab in engines with no PIVOT, and it is readable as long as the column list is short.',
 'Conditional aggregation is how you pivot in SQL that has no PIVOT.'),

('conditional-aggregation', 2, 'FILTER is the clearer form where it exists',
 'Postgres supports COUNT(*) FILTER (WHERE condition), which says the same thing as the CASE trick with far less noise. Use it where the engine supports it; keep CASE for portability and for older engines.',
 'Same result, less to misread. Prefer FILTER on Postgres.'),

('dates-in-sql', 1, 'Truncation and the boundary bug',
 'Grouping by month means date_trunc(''month'', ts), not a substring of a formatted string. And a range filter written as ts <= ''2026-01-31'' silently drops everything after midnight on the 31st — the safe form is ts >= start AND ts < next_start.',
 'Half-open ranges: >= start AND < next start. It is correct at every granularity.'),

('dates-in-sql', 2, 'Time zones change what "today" means',
 'A timestamp stored in UTC and grouped by day gives days that end at midnight UTC, which is 6am in Dhaka. Daily reports disagree with what the business calls a day unless the conversion happens before truncation.',
 'Convert to the business time zone first, then truncate. Never the reverse.'),

('union-vs-union-all', 1, 'Column types must line up, not just column counts',
 'Both sides need the same number of columns in the same order with compatible types. Engines will implicitly cast some mismatches, which is worse than an error — a date column silently becoming text sorts wrongly downstream.',
 'Match the column list deliberately. Implicit casts hide in UNION.'),

('union-vs-union-all', 2, 'UNION ALL plus a source tag',
 'When stacking two sources, add a literal column naming each — SELECT ..., ''online'' AS channel. It keeps the result traceable, makes later grouping trivial, and costs nothing.',
 'Tag each side when you stack them. Future you will need to tell them apart.'),

('indexes', 1, 'Why a function on a column kills the index',
 'WHERE date_trunc(''day'', created_at) = ''2026-01-05'' cannot use an index on created_at, because the index stores the column, not the function of it. Rewriting as a half-open range restores it — or you create an expression index deliberately.',
 'Wrap a column in a function and the index on it stops being usable.'),

('indexes', 2, 'Composite index column order matters',
 'An index on (customer_id, created_at) helps queries filtering by customer_id, or by both, but not by created_at alone — the leftmost columns must be used. This is why index design follows the queries you actually run rather than the columns that feel important.',
 'Leftmost-prefix rule: order composite index columns by how you filter.'),

('normalisation', 1, 'The normal forms, in the order they matter',
 'First: no repeating groups, one value per cell. Second: every non-key column depends on the whole key. Third: no column depends on another non-key column. Most practical schema problems are third-normal-form violations — a city column sitting beside a postcode that determines it.',
 'Most real modelling bugs are 3NF violations, not exotic ones.'),

('normalisation', 2, 'Star schemas denormalise on purpose',
 'Analytical warehouses use fact tables surrounded by denormalised dimensions, accepting duplication to avoid joining eight tables for every dashboard. That is a deliberate trade for read speed — which is only defensible when a pipeline, not a human, maintains the duplication.',
 'Normalise where humans write. Denormalise where machines rebuild.')

) AS v(topic_slug, ord, title, body, takeaway)
JOIN public.topics t ON t.slug = v.topic_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.topic_sections s WHERE s.topic_id = t.id AND s.title = v.title
);

SELECT count(*) AS sections, count(DISTINCT topic_id) AS topics_covered FROM public.topic_sections;
