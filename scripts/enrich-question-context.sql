-- Give every authored question a real scenario and progressive clues.
--
-- The complaint was fair: several stems were one line of setup, which tests
-- recall of a phrase rather than understanding of a situation. Two changes per
-- question:
--
--   content_md — the context a candidate would actually be given: the system,
--   the numbers, what has already been ruled out. Enough to reason from.
--
--   hints — progressive clues, revealed one per failed attempt by the existing
--   hint escalation in the workspace. They narrow the search without naming the
--   answer, which is what a good interviewer does when you stall.

-- ── AI: retrieval and generation ────────────────────────────────────────────
UPDATE public.careerprep_questions SET
 content_md = E'Your support assistant indexes 40,000 help-centre chunks with `text-embedding-3-small`. Six weeks in, the team wants to move to a newer embedding model that scores better on benchmarks.\n\nThe migration plan: point the ingestion job at the new model so all new documents use it, and leave the 40,000 existing vectors as they are to save a re-embedding run.\n\nWhat happens to retrieval quality?',
 hints = '["An embedding is a position in a space that one specific model defined.","Cosine similarity between two vectors only means something if both were produced by the same model.","Nothing errors. That is the dangerous part — the failure is silent and gradual."]'::jsonb
WHERE slug = 'ai-q-emb-1';

UPDATE public.careerprep_questions SET
 content_md = E'You are choosing an index type for 8 million document chunks. The docs offer exact (flat) search and approximate options — HNSW and IVFFlat.\n\nA colleague argues that exact search should be the default because "approximate" sounds like it returns wrong answers, and correctness matters more than speed.\n\nWhy do production systems still choose approximate search?',
 hints = '["Think about what exact search has to do for every single query.","How does the work scale as the number of vectors grows from 8 thousand to 8 million?","The tradeoff is not accuracy versus speed in general — it is a small, measurable recall loss for a very large speed gain."]'::jsonb
WHERE slug = 'ai-q-emb-2';

UPDATE public.careerprep_questions SET
 content_md = E'Your extraction endpoint must return JSON with exactly four keys. In testing it does so about 70% of the time; the rest are close but wrong — an extra field, a wrapped object, prose before the JSON.\n\nThe task itself is being done correctly. There is no training budget and no time for a fine-tuning cycle.\n\nWhat is the cheapest change that reliably fixes the format?',
 hints = '["The model understands the task. It is guessing at the shape of the output.","Description tells a model what you want; something else shows it.","Two or three examples usually pin down format better than a paragraph describing it."]'::jsonb
WHERE slug = 'ai-q-prompt-1';

UPDATE public.careerprep_questions SET
 content_md = E'You are adding chain-of-thought to four endpoints to improve accuracy. It costs extra output tokens and latency on every call, so you want to apply it only where it pays.\n\nThe four tasks: multi-step arithmetic on invoice data; classifying a ticket into one of three labels; answering a question that needs three retrieved facts combined; and diagnosing a failing test from a stack trace.\n\nWhere does chain-of-thought help least?',
 hints = '["Chain-of-thought helps when the answer needs intermediate steps.","Ask which of these a competent person would answer instantly, without working anything out.","Reasoning tokens spent on a task with no reasoning in it are pure cost."]'::jsonb
WHERE slug = 'ai-q-prompt-2';

UPDATE public.careerprep_questions SET
 content_md = E'You are building an assistant for a wholesaler. It answers questions about a price list of 4,000 products, updated every Monday by the commercial team.\n\nThe base model already answers in the right tone and format — the only problem is that it does not know these prices, and quoting a stale price has contractual consequences.\n\nFine-tune, or retrieve?',
 hints = '["Ask what is actually missing: knowledge, or behaviour?","What happens on Monday when 400 prices change?","One of these options can be updated in seconds; the other needs a training run."]'::jsonb
WHERE slug = 'ai-q-ft-1';

UPDATE public.careerprep_questions SET
 content_md = E'Your team wants to fine-tune a 7B model on 3,000 examples of your house report format. Full fine-tuning needs more GPU memory than you have, and someone suggests LoRA.\n\nBefore approving it, you want to be able to explain in one sentence what LoRA changes during training.',
 hints = '["The base model weights are not being updated.","LoRA adds something small and trains that instead.","The name is the clue: low-rank adaptation."]'::jsonb
WHERE slug = 'ai-q-ft-2';

UPDATE public.careerprep_questions SET
 content_md = E'A billing agent has three tools: look up an invoice, issue a refund, and charge a card. The orchestration loop retries any tool call that returns an error.\n\nLast night the payment gateway timed out on a charge. The agent saw the error and called the tool again. The gateway had, in fact, processed the first charge — the customer was billed twice.\n\nWhat must be true of the tool for a retry to be safe?',
 hints = '["The model behaved reasonably: an action failed, so it retried.","The defect is in what the tool allows, not in what the model decided.","There is a standard property that makes repeating an operation harmless."]'::jsonb
WHERE slug = 'ai-q-agent-1';

UPDATE public.careerprep_questions SET
 content_md = E'Your agent framework offers a maximum-iterations setting, defaulting to unlimited. A reviewer asks why you set it to 12.\n\nConsider what happens when a task is impossible — a required document does not exist, or a tool is misconfigured — and the model keeps trying alternative approaches.',
 hints = '["What does the loop do when the task simply cannot be completed?","Every iteration is another model call, with cost and latency attached.","The user is waiting the whole time, and no answer is coming."]'::jsonb
WHERE slug = 'ai-q-agent-2';

-- ── SQL checkpoints ─────────────────────────────────────────────────────────
UPDATE public.careerprep_questions SET
 content_md = E'A revenue report reads from `customers`, which has one row per customer with a `lifetime_value` column.\n\nBefore: `SELECT SUM(lifetime_value) FROM customers` returns ৳4.1 crore, matching finance.\n\nAfter adding a join to `orders` so the report can filter by order date, the same SUM returns ৳12.7 crore. No rows were added to either table, and no filter was applied yet.\n\nWhat happened?',
 hints = '["Count how many rows one customer produces after the join.","A customer with three orders now appears three times in the result set.","SUM does not know the rows are repeats of the same customer."]'::jsonb
WHERE slug = 'sql-cp-joins';

UPDATE public.careerprep_questions SET
 content_md = E'You are auditing a `subscribers` table before a mail-out.\n\n`SELECT COUNT(*) FROM subscribers` returns 500.\n`SELECT COUNT(email) FROM subscribers` returns 480.\n\nNo WHERE clause on either. What do you now know about the table?',
 hints = '["COUNT(*) and COUNT(column) count different things.","One of them skips something.","Twenty rows exist but contribute nothing to the second count."]'::jsonb
WHERE slug = 'sql-cp-groupby';

UPDATE public.careerprep_questions SET
 content_md = E'You are writing a query that returns customers who spent more than ৳10,000 on orders placed in 2026.\n\nBoth conditions could technically be written in either WHERE or HAVING — the query runs either way. One placement is correct and faster; the other filters at the wrong stage.\n\nWhich condition belongs in WHERE?',
 hints = '["WHERE runs before rows are grouped. HAVING runs after.","Ask of each condition: is this a fact about one row, or about a whole group?","An aggregate cannot appear in WHERE at all — the group does not exist yet."]'::jsonb
WHERE slug = 'sql-cp-having';

UPDATE public.careerprep_questions SET
 content_md = E'You want every staff member who is not a manager:\n\n```sql\nSELECT name FROM staff\nWHERE id NOT IN (SELECT manager_id FROM staff);\n```\n\nThe table has 240 staff and 12 managers, so you expect 228 rows. The query returns **zero rows**, with no error.\n\n`manager_id` is nullable, and most staff have one — but the CEO''s is NULL.',
 hints = '["What does `id = NULL` evaluate to? Not false — something else.","NOT IN expands to a chain of comparisons, all of which must be true.","One unknown in that chain is enough to stop any row qualifying."]'::jsonb
WHERE slug = 'sql-cp-null';

UPDATE public.careerprep_questions SET
 content_md = E'Two queries over the same daily sales table:\n\n```sql\nSELECT d, SUM(x) OVER ()             FROM sales;  -- same number on every row\nSELECT d, SUM(x) OVER (ORDER BY d)  FROM sales;  -- climbs day by day\n```\n\nThe only difference is ORDER BY inside OVER(). Why does that turn a grand total into a running total?',
 hints = '["ORDER BY inside OVER() does more than sort the output.","Each row has a window — a set of rows it can see.","Adding ORDER BY gives that window a default end point: the current row."]'::jsonb
WHERE slug = 'sql-cp-window';

UPDATE public.careerprep_questions SET
 content_md = E'Revenue by product this quarter:\n\n| product | revenue |\n|---|---|\n| A | 90,000 |\n| B | 70,000 |\n| C | 70,000 |\n| D | 50,000 |\n\nProducts B and C tie. The business wants D shown as **third place**, because there are three distinct revenue levels above nothing — not fourth.\n\nWhich ranking function produces that?',
 hints = '["Three functions rank; they differ only in how they treat ties.","One skips numbers after a tie, one does not, one refuses to tie at all.","Ask what the next number after 1, 2, 2 should be."]'::jsonb
WHERE slug = 'sql-cp-rank';

UPDATE public.careerprep_questions SET
 content_md = E'You want the top 3 products per category by revenue:\n\n```sql\nSELECT category, product,\n       DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS r\nFROM product_revenue\nWHERE r <= 3;   -- ERROR: column "r" does not exist\n```\n\nThe error is real, not a typo. Why can the window function not be filtered in WHERE, and what is the standard shape instead?',
 hints = '["Think about the order the database evaluates clauses in.","WHERE runs before SELECT, so nothing defined in SELECT exists yet.","The usual fix wraps the ranked query and filters one level up."]'::jsonb
WHERE slug = 'sql-cp-cte';

UPDATE public.careerprep_questions SET
 content_md = E'A finance dashboard needs, per month: total paid revenue and total unpaid revenue, side by side, from one `orders` table with a `status` column.\n\nYou could run two queries and join them on month. The table has 40 million rows, so each pass is expensive.\n\nWhat produces both measures in a single scan?',
 hints = '["A WHERE clause would remove the rows you still need for the other column.","The condition has to live inside the aggregate, not before it.","CASE turns a condition into a number the aggregate can add up."]'::jsonb
WHERE slug = 'sql-cp-condagg';

UPDATE public.careerprep_questions SET
 content_md = E'`orders.created_at` is a `timestamptz`. You want every order placed in January 2026.\n\nOne colleague writes `BETWEEN ''2026-01-01'' AND ''2026-01-31''`. The monthly total is consistently a little lower than finance''s.\n\nWhich filter is correct at any time granularity, and why do the others leak?',
 hints = '["A date literal compared against a timestamp becomes midnight.","What happens to an order placed at 14:30 on the 31st?","A half-open range has no such edge — it is correct whether the column stores days, seconds or microseconds."]'::jsonb
WHERE slug = 'sql-cp-dates';

UPDATE public.careerprep_questions SET
 content_md = E'You are stacking online orders and in-store orders into one result for a monthly report. The two sources are separate systems and an order can only exist in one of them — there is no possibility of overlap.\n\nThe table has 60 million rows. A colleague has written UNION because "it is safer".\n\nWhich is right here, and what does the other one cost?',
 hints = '["One of them de-duplicates the combined result.","De-duplication is not free — it needs a sort or a hash over everything.","If overlap is impossible, what does that work actually find?"]'::jsonb
WHERE slug = 'sql-cp-union';

UPDATE public.careerprep_questions SET
 content_md = E'`orders` has 40 million rows and an index on `created_at`. This query takes 40 seconds:\n\n```sql\nSELECT * FROM orders\nWHERE date_trunc(''day'', created_at) = DATE ''2026-01-05'';\n```\n\nEXPLAIN shows a sequential scan. The index exists, is valid, and is used by other queries on the same column.',
 hints = '["The index stores values of the column, sorted.","The query is not asking about the column — it is asking about a function of it.","Rewriting the filter as a range restores the index. So does an expression index, if you create one deliberately."]'::jsonb
WHERE slug = 'sql-cp-index';

UPDATE public.careerprep_questions SET
 content_md = E'A `customers` table holds, among other columns: `customer_id` (primary key), `postcode`, and `city`.\n\nEvery postcode maps to exactly one city, and both are stored on every row. A data-entry fix last month updated 300 postcodes but not their cities, and reports have disagreed since.\n\nWhich normal form does this design break?',
 hints = '["Both columns are non-key columns.","One of them is fully determined by the other, not by the primary key.","That specific shape — a non-key column depending on another non-key column — has a name."]'::jsonb
WHERE slug = 'sql-cp-norm';

SELECT count(*) AS enriched
FROM public.careerprep_questions
WHERE hints IS NOT NULL AND jsonb_array_length(hints) > 0 AND slug LIKE ANY (ARRAY['ai-q-%','sql-cp-%']);
