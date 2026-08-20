-- First batch of Concepts, targeted at the categories that actually carry
-- assessed questions (Aggregation 42, Joins 38, Window Functions 26,
-- Filtering 19, Conditional Aggregation 15, Subqueries 15, NULL Semantics 6,
-- Dates 12, Set Operations 3) plus the three theory Checkpoints that had no
-- explanation anywhere: indexes, normalisation, and the ranking functions.
--
-- Every row is inserted as a DRAFT. Nothing reaches a learner until it is
-- published one at a time from the Concepts tab. That is deliberate: 184
-- placeholder Checkpoints already exist, and a wave of unreviewed explanations
-- would discredit the reviewed ones exactly the same way.
--
-- Re-runnable: slug is unique and every insert is guarded.

INSERT INTO public.concepts (slug, title, what_it_is, why_it_matters, how_it_works, analogy, status) VALUES

('joins', 'Joins',
 'A join reads two tables at once and returns rows built from both, matched on a column they share.',
 'Real data is split across tables on purpose — customers in one, orders in another — so almost every useful question spans more than one. Interviews lean on joins because getting the *type* wrong silently changes the answer rather than throwing an error.',
 'You give the database a matching rule (`ON o.customer_id = c.id`) and a type. An INNER JOIN keeps only rows that matched. A LEFT JOIN keeps every row from the left table and fills the right side with NULL where nothing matched — which is how you find customers with no orders. The join type decides what happens to the rows that did not match; nothing else.',
 'Two class registers: one with names and roll numbers, one with exam marks and roll numbers. An inner join is reading out only the students who appear in both. A left join is reading the full name list and writing "absent" beside anyone with no marks.',
 'draft'),

('group-by-aggregation', 'GROUP BY and aggregation',
 'Aggregation collapses many rows into one summary number — a count, a sum, an average. GROUP BY says which rows get collapsed together.',
 'It is the single most common shape of an analytics question: revenue per month, orders per customer, average delivery time per district. It is also the most common place to be quietly wrong, because a query with the wrong grouping still runs and still returns a plausible table.',
 'GROUP BY splits the rows into buckets — one per distinct value of the column you name — and the aggregate function then runs once per bucket. Every column in your SELECT must either be in the GROUP BY or be inside an aggregate, because anything else has no single value for the bucket.',
 'Sorting a pile of receipts into one stack per shop, then adding up each stack. GROUP BY is how you decide what makes a stack; SUM is what you do to a stack once it exists.',
 'draft'),

('where-vs-having', 'WHERE vs HAVING',
 'Two filters that look alike and run at different times: WHERE filters rows before grouping, HAVING filters groups after.',
 'It is the classic screening question, and the reason is practical — putting a condition in the wrong one either errors out or, worse, answers a different question than the one asked.',
 'The database filters with WHERE first, then forms the groups, then applies the aggregates, then filters those results with HAVING. So "orders placed this year" belongs in WHERE (it is a fact about one row), while "customers who spent more than 10,000" belongs in HAVING (it is a fact about a whole group). An aggregate can never appear in WHERE, because at that moment no group exists yet.',
 'Hiring: WHERE is the CV screen that drops individual applicants before you form interview panels. HAVING is dropping a whole panel afterwards because the panel as a group scored too low.',
 'draft'),

('null-semantics', 'NULL semantics',
 'NULL is not zero and not an empty string — it is the absence of a value, and comparing anything to it gives neither true nor false.',
 'NULL is where correct-looking queries quietly lose rows. A filter that seems to cover every case, `status = ''active'' OR status != ''active''`, drops every row where status is NULL — and nothing warns you.',
 'Any comparison with NULL evaluates to unknown, so `= NULL` never matches; you need `IS NULL` or `IS NOT NULL`. Most aggregates skip NULLs, so AVG over a column with gaps averages fewer rows than you think, and COUNT(column) is smaller than COUNT(*). An outer join manufactures NULLs for the rows that did not match, which is why "no orders" shows up as NULL rather than 0.',
 'A form where someone left a field blank. Blank is not "zero taka" — it is "we do not know". You cannot say whether an unknown amount is bigger or smaller than 500, and the honest answer to any question about it is "unknown", which is exactly what SQL says.',
 'draft'),

('window-functions', 'Window functions',
 'A calculation across a set of related rows that, unlike GROUP BY, does not collapse them — each row keeps its own line and gains a new column.',
 'Running totals, "each customer''s share of their district''s revenue", "the previous order date for this customer" — all need row-level detail *and* a group-level number at the same time. Without windows you write the query twice and join it to itself.',
 'OVER() defines the window — which rows this row can see. PARTITION BY splits the data into groups the way GROUP BY does, but keeps the rows. ORDER BY inside OVER() gives the window a direction, which is what makes running totals and LAG/LEAD possible. The function then runs once per row against its window.',
 'Standing in a queue. GROUP BY asks the queue to merge into a single summary. A window function lets you stay where you are and look sideways: how many people are ahead of me, what is the total for my line, who was the person before me.',
 'draft'),

('rank-vs-dense-rank', 'RANK, DENSE_RANK and ROW_NUMBER',
 'Three ranking functions that differ only in how they treat ties.',
 'Interviewers use them precisely because the difference only shows up when two rows tie — and "top 3" questions almost always contain a tie deliberately.',
 'ROW_NUMBER always gives distinct numbers, breaking ties arbitrarily. RANK gives tied rows the same number and then skips: 1, 2, 2, 4. DENSE_RANK gives tied rows the same number and does not skip: 1, 2, 2, 3. Which one is right depends entirely on what "third place" is supposed to mean in the question.',
 'Two runners cross the line together in second. RANK says the next runner is fourth — the places are used up. DENSE_RANK says third — the podium has three steps whoever stands on them. ROW_NUMBER just needs someone to be second and someone third, and will pick.',
 'draft'),

('subqueries-and-ctes', 'Subqueries and CTEs',
 'A query used inside another query. A CTE (`WITH … AS`) is the same idea given a name and written at the top instead of nested in the middle.',
 'Multi-step questions — "the customers whose average order is above the overall average" — cannot be answered in one flat pass. CTEs are what keep those queries readable enough to debug, which matters more in an interview than saving a line.',
 'A subquery runs and hands its result to the outer query, either as a single value, a list for IN, or a table to join against. A CTE does the same thing but is named and can be referenced more than once, and several CTEs can build on each other in order. The database is free to execute either shape efficiently; the difference is for the reader.',
 'Cooking from a recipe. A subquery is a whole sub-recipe crammed into the middle of a sentence. A CTE is prepping that component first, putting it in a labelled bowl, and then referring to "the marinade" in the main steps.',
 'draft'),

('conditional-aggregation', 'Conditional aggregation',
 'Counting or summing only the rows that meet a condition, inside a single aggregate — `SUM(CASE WHEN … THEN 1 ELSE 0 END)` or `COUNT(*) FILTER (WHERE …)`.',
 'It is how one query answers several questions at once: paid vs unpaid orders per month, side by side, in one pass. Writing three queries and joining them is the slower, more fragile version of the same answer.',
 'CASE turns a condition into a number per row — 1 when it holds, 0 when it does not — and the aggregate then adds those up per group. Because the condition lives inside the aggregate rather than in WHERE, rows that fail it are still counted in the group, just as zero.',
 'Counting a crowd with several tally counters at once: one for adults, one for children. Everyone still walks past you once — you just press a different counter, instead of asking half the crowd to leave and counting again.',
 'draft'),

('dates-in-sql', 'Dates in SQL',
 'Dates are their own type with their own arithmetic — not text that happens to look like a date.',
 'Storing dates as text is one of the most expensive mistakes in a real schema: sorting goes alphabetical, ranges silently miss rows, and every query pays to convert. It is also a favourite interview question because the failure is invisible until the data crosses a year or a format.',
 'A real date type sorts chronologically, supports subtraction to give an interval, and works with truncation (`date_trunc(''month'', …)`) for grouping by period. Text does none of that: ''09/01/2026'' sorts before ''10/12/2025'', and no function can fix the ambiguity of which number is the month.',
 'Filing letters by the date written on the envelope versus filing them by the words in the date. Alphabetical order puts April before January and is perfectly consistent about it — and completely useless.',
 'draft'),

('union-vs-union-all', 'UNION vs UNION ALL',
 'Both stack the results of two queries on top of each other. UNION removes duplicate rows; UNION ALL keeps everything.',
 'UNION is the default people reach for, and it is the slower one — it has to sort or hash the whole result to find duplicates. On large tables that is a real cost paid for a de-duplication nobody asked for.',
 'Both require the same number of columns with compatible types, in the same order. UNION ALL simply concatenates. UNION concatenates and then removes exact duplicate rows across the whole result — not just within one side. If you know the two sets cannot overlap, UNION ALL is both faster and more honest about intent.',
 'Merging two guest lists. UNION ALL tapes them end to end. UNION reads every name twice to make sure nobody is written down twice — worth it if the lists overlap, wasted effort if they cannot.',
 'draft'),

('indexes', 'Indexes',
 'A separate, ordered structure the database keeps beside a table so it can find rows without reading all of them.',
 'It is the difference between a query that returns instantly and the same query taking a minute on the same data. It is also the most common answer to "this got slow as we grew" — and the most common thing a candidate can explain only vaguely.',
 'Without an index the database scans every row. With one on the column you filter or join by, it can jump straight to the matching rows. The trade is write cost and storage: every insert and update must maintain every index, so more is not better. An index also only helps if the query uses the column plainly — wrapping it in a function usually means the index is skipped.',
 'The index at the back of a textbook. Finding every mention of "normalisation" by flipping through all 600 pages works, and takes all evening. The index costs a few pages and some effort to compile, and turns the same search into seconds — but it has to be rebuilt every time the book is edited.',
 'draft'),

('normalisation', 'Normalisation',
 'Organising data so each fact is stored in exactly one place, with tables linked by keys instead of repeating the same values.',
 'Repeated data is data that will eventually disagree with itself — a customer''s phone number updated in three rows and stale in the fourth. Normalisation is why the schema looks like several small tables instead of one wide spreadsheet, and interviewers ask because the alternative is what everyone builds first.',
 'Each entity gets its own table with its own key: customers, orders, products. Anything that describes a customer lives once, in the customers table, and orders point at it by id. Joins then reassemble the picture on demand. Analytical systems sometimes denormalise deliberately — accepting duplication to make reads faster — but that is a decision, not a default.',
 'One phone number in your contacts, referenced by every conversation, versus writing the number again at the top of every message you send. The second way is quicker per message and guarantees that one day some of the copies are wrong.',
 'draft')

ON CONFLICT (slug) DO NOTHING;
