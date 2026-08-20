-- Sub-topic cards, checkpoints and case studies for the Data Engineer and BI
-- Topics. Same treatment as every other Topic; MCQ-assessed because Spark,
-- Kafka and semantic layers have no grader on this platform.

INSERT INTO public.topic_sections (topic_id, title, body, takeaway, order_index)
SELECT t.id, v.title, v.body, v.takeaway, v.ord
FROM (VALUES
('etl-vs-elt',1,'Keep the raw layer',
 'Land source data unchanged in a raw layer nobody edits, then build staged and marts layers from it. When a transformation rule turns out to be wrong — and it will — you replay from raw instead of re-requesting six months of history from a system that no longer has it.',
 'Raw data you deleted is the one thing no amount of compute can recover.'),
('etl-vs-elt',2,'Transformations belong in version control',
 'Business logic living in a GUI, a scheduled query or someone''s notebook cannot be reviewed, tested or reverted. The same logic as SQL files in a repository gets a pull request, a test and a history.',
 'If a metric changed and git cannot tell you when, the logic is in the wrong place.'),

('orchestration-and-idempotency',1,'Backfill is the real test',
 'Any pipeline runs once. A pipeline you can re-run for last March, twice, without corrupting anything is the actual bar — and it is only achievable if the run date is a parameter and writes are overwrite-by-partition or key-based merges.',
 'Design for the backfill. The nightly run is the easy case.'),
('orchestration-and-idempotency',2,'Retries need a poison-message plan',
 'Infinite retries on a permanently broken input block the queue behind it. Cap attempts, route the failure somewhere visible, and alert — a task silently retrying for nine hours looks identical to a task that is working.',
 'Every retry policy needs an exit that a human sees.'),

('batch-vs-streaming',1,'Late and out-of-order data',
 'Event time is when it happened; processing time is when you saw it. A phone offline for an hour delivers events an hour late, and a window closed on processing time silently loses them. Watermarks decide how long you wait before deciding a window is done.',
 'Window on event time, and choose explicitly how long you wait for stragglers.'),
('batch-vs-streaming',2,'Effective exactly-once',
 'End-to-end exactly-once is expensive and often unnecessary. At-least-once delivery plus idempotent writes keyed on an event id gives the same observable result at a fraction of the complexity, which is what most production systems actually run.',
 'Idempotent writes buy you exactly-once behaviour without exactly-once machinery.'),

('distributed-processing',1,'Shuffle is the cost',
 'Reading and filtering scale nearly linearly. The moment an operation needs rows with the same key on the same machine, data crosses the network, and that is where runtime goes. Reducing shuffles matters more than adding executors.',
 'Count the shuffles before you add machines.'),
('distributed-processing',2,'Broadcast the small side',
 'Joining a billion-row fact to a thousand-row dimension does not need a shuffle: send the small table to every executor. Most engines do it automatically below a size threshold — and quietly stop when the table creeps past it, which is a classic overnight regression.',
 'Know your broadcast threshold. Crossing it turns a fast job slow with no code change.'),

('event-streams',1,'Ordering is per partition only',
 'A topic guarantees order within a partition, never across. Events for one entity stay ordered only if they share a key, which is why choosing the key is a correctness decision rather than a throughput one.',
 'The message key is what buys you ordering. Choose it before scale.'),
('event-streams',2,'Consumer lag is the health metric',
 'Lag — how far behind the latest offset a consumer is — tells you whether the system is keeping up. Rising lag is the earliest signal of a downstream problem, well before anyone notices stale data.',
 'Alert on lag trend, not on absolute lag.'),

('storage-formats-and-lakehouse',1,'The small-file problem',
 'Thousands of tiny files cost more in metadata listing than they save in scanning. Over-partitioning is the usual cause — partitioning by hour when queries filter by month. Compaction jobs exist because everyone hits this.',
 'Partition to how you query, not to how the data arrives.'),
('storage-formats-and-lakehouse',2,'Schema evolution without a rewrite',
 'Table formats record schema in metadata, so adding a column is a metadata change rather than rewriting terabytes. Renames and type changes are still breaking for readers, and that is what a data contract is for.',
 'Adding is cheap. Renaming is a breaking change wearing a small diff.'),

('data-quality-and-contracts',1,'Test at the boundary you do not control',
 'Your own transformations are reviewable; the upstream system is not. The highest-value tests sit at ingest — schema, volume, freshness — because that is where surprises enter.',
 'Put the tightest tests where the data crosses a team boundary.'),
('data-quality-and-contracts',2,'Fail the run, do not publish',
 'A pipeline that publishes bad data and logs a warning has chosen the worst option: the business acts on it. Halting is visible and recoverable; silent corruption is neither.',
 'Stale but correct beats fresh but wrong. Stop the run.'),

('dimensional-modelling',1,'Declare the grain first',
 'Write down what one row of the fact table means before anything else — one order line, one payment, one page view. Every later question about duplicates, joins and sums is answered by that sentence, and every fan-out bug is a grain that was never declared.',
 'One sentence: "one row is one ___". Write it before the DDL.'),
('dimensional-modelling',2,'Slowly changing dimensions',
 'A customer moves region. Type 1 overwrites and history silently changes; type 2 adds a row with validity dates so last year''s report still says last year''s region. Which you choose is a business decision about whether history should be stable.',
 'Overwrite and you rewrite the past. Version and you can explain it.'),

('semantic-layer',1,'Why agents made this urgent',
 'A person given two conflicting revenue tables asks which is right. An agent picks one and answers confidently at scale. That difference is why the semantic layer moved from BI hygiene to a hiring round in 2026.',
 'Ambiguity a human would query, an agent will confidently guess.'),
('semantic-layer',2,'Metrics as code',
 'Definitions in version-controlled files get review, tests and history, and one change propagates everywhere at once. The alternative — the same logic pasted into forty dashboards — guarantees they disagree within a quarter.',
 'Define once, compile everywhere. Copies are how metrics drift.'),

('metric-definition',1,'The awkward cases are the definition',
 'Anyone can define revenue for a clean sale. The definition is really made by the refunds, the partial payments, the cancellations, the test accounts and the currency conversion date. Decide those explicitly or each report decides differently.',
 'Write the exclusions down. They are where two dashboards diverge.'),
('metric-definition',2,'Certification and ownership',
 'Every metric needs a named owner and a status. Without them, a dashboard built once by someone who left becomes an authority nobody can question or change.',
 'An unowned metric is a rumour with a chart.'),

('dashboard-design',1,'Design for one decision',
 'Ask what the viewer does differently depending on the number. If there is no action, the chart is decoration; if there are six actions, it is six dashboards pretending to be one.',
 'No decision, no dashboard.'),
('dashboard-design',2,'Alerts, notebooks and dashboards are different tools',
 'Monitoring wants an alert. A one-off question wants an answer. An open exploration wants a notebook. A dashboard is for a recurring decision made from the same few numbers — and using it for the other three is why so many go unopened.',
 'Match the artefact to the cadence of the question.'),

('report-performance',1,'Aggregate at the reporting grain',
 'Dashboards rarely need row-level detail. A nightly aggregate at the grain the report shows turns a billion-row scan into a thousand-row read, and detail can stay one drill-through away.',
 'Serve the summary; keep the detail one click deeper.'),
('report-performance',2,'Cardinality is the hidden cost',
 'High-cardinality columns blow up in-memory models and make filters slow. Bucketing, or removing an id nobody filters by, often does more than any query tuning.',
 'Look at distinct counts before you look at query plans.'),

('translating-business-questions',1,'Find the decision behind the question',
 '"How are sales doing?" is not answerable. "Should we keep the east-region promotion running past Friday?" is — and it dictates the grain, the comparison and the threshold. Getting to the second sentence is most of the job.',
 'Ask what changes based on the answer. That question writes the query.'),
('translating-business-questions',2,'Deliver the caveat with the number',
 'A number handed over bare will be quoted bare. Attach what it excludes and how confident it is at the moment of delivery, in the same message, or you will be correcting it in a board deck later.',
 'The caveat travels with the number or it does not travel at all.')
) AS v(topic_slug, ord, title, body, takeaway)
JOIN public.topics t ON t.slug = v.topic_slug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_sections s WHERE s.topic_id=t.id AND s.title=v.title);

-- ── Checkpoints ─────────────────────────────────────────────────────────────
INSERT INTO public.careerprep_questions
  (slug, title, difficulty, industry, category, question_type, content_md, schema_sql, initial_sql, solution_sql, options, correct_option, is_generated)
VALUES
('de-cp-elt','Why does ELT dominate modern warehouses?','Medium','Data','Data Engineering','mcq',
 'Same sources, same warehouse, different order of operations.','','','',
 '[{"label":"A","text":"Transforming before load is technically impossible in cloud warehouses."},
   {"label":"B","text":"Raw data is preserved, so a wrong rule can be fixed and replayed over history."},
   {"label":"C","text":"ELT uses less storage."},
   {"label":"D","text":"ELT removes the need for data quality tests."}]'::jsonb,'B',false),

('de-cp-idempotent','A nightly task appends rows. It is retried after a partial failure. What breaks?','Hard','Data','Data Engineering','mcq',
 'The retry succeeds and nobody notices anything wrong that night.','','','',
 '[{"label":"A","text":"Nothing — appends are safe."},
   {"label":"B","text":"Rows written before the failure are appended again, silently duplicating that day''s data."},
   {"label":"C","text":"The DAG deadlocks."},
   {"label":"D","text":"The scheduler skips the next run."}]'::jsonb,'B',false),

('de-cp-watermark','What is a watermark for in a streaming job?','Hard','Data','Data Engineering','mcq',
 'Events arrive out of order from mobile clients.','','','',
 '[{"label":"A","text":"It marks which records have been read by which consumer."},
   {"label":"B","text":"It decides how long to wait for late events before closing a window."},
   {"label":"C","text":"It deduplicates events with the same key."},
   {"label":"D","text":"It compresses the state store."}]'::jsonb,'B',false),

('de-cp-skew','A Spark job has 199 tasks finishing in seconds and one running for an hour. What is it?','Medium','Data','Data Engineering','mcq',
 'Same job, same code, only production data.','','','',
 '[{"label":"A","text":"Insufficient executor memory."},
   {"label":"B","text":"Data skew: one key holds most of the rows, so one task does most of the work."},
   {"label":"C","text":"A missing index on the source table."},
   {"label":"D","text":"Too many partitions."}]'::jsonb,'B',false),

('de-cp-ordering','Events for one customer arrive out of order across partitions. Why?','Medium','Data','Data Engineering','mcq',
 'The topic has 12 partitions and events are produced without a key.','','','',
 '[{"label":"A","text":"Ordering is guaranteed per partition only, and unkeyed events are spread across partitions."},
   {"label":"B","text":"The consumer group is misconfigured."},
   {"label":"C","text":"Retention is too short."},
   {"label":"D","text":"Ordering requires exactly-once mode."}]'::jsonb,'A',false),

('de-cp-smallfiles','Queries slowed after partitioning by hour instead of day. Why?','Hard','Data','Data Engineering','mcq',
 'Same data volume, finer partitions.','','','',
 '[{"label":"A","text":"Hourly partitions cannot be pruned."},
   {"label":"B","text":"Many small files cost more in metadata listing and per-file overhead than the extra pruning saves."},
   {"label":"C","text":"Parquet does not support hourly partitions."},
   {"label":"D","text":"Compression ratios fall with smaller files, doubling scan size."}]'::jsonb,'B',false),

('de-cp-quality','A pipeline is green but the dashboard is wrong for three weeks. Which control was missing?','Medium','Data','Data Engineering','mcq',
 'No task failed in that period.','','','',
 '[{"label":"A","text":"More retries."},
   {"label":"B","text":"Data tests on the data itself — freshness, volume, uniqueness — that fail the run rather than logging a warning."},
   {"label":"C","text":"A larger cluster."},
   {"label":"D","text":"A second scheduler."}]'::jsonb,'B',false),

('de-cp-scd','Last year''s report must show last year''s customer region. Which dimension type?','Medium','Data','Data Engineering','mcq',
 'Customers occasionally move between regions.','','','',
 '[{"label":"A","text":"Type 1 — overwrite the region."},
   {"label":"B","text":"Type 2 — add a new row with validity dates and keep the old one."},
   {"label":"C","text":"Store region on the fact table only."},
   {"label":"D","text":"Recompute regions at query time."}]'::jsonb,'B',false),

('bi-cp-semantic','Why did semantic layers become a 2026 interview round?','Medium','Data','Business Intelligence','mcq',
 'The idea itself is not new.','','','',
 '[{"label":"A","text":"BI tools stopped supporting SQL."},
   {"label":"B","text":"AI agents now query metrics directly, and an agent given ambiguous tables invents a definition confidently instead of asking."},
   {"label":"C","text":"Warehouses became too slow for direct queries."},
   {"label":"D","text":"Dashboards were deprecated."}]'::jsonb,'B',false),

('bi-cp-metric','Two dashboards report different active-user counts. What is the first fix?','Easy','Data','Business Intelligence','mcq',
 'Both queries run without error against the same warehouse.','','','',
 '[{"label":"A","text":"Rebuild the slower dashboard."},
   {"label":"B","text":"Agree and write down one definition — grain, filters, time basis, exclusions — and certify it."},
   {"label":"C","text":"Average the two numbers."},
   {"label":"D","text":"Switch both to the same BI tool."}]'::jsonb,'B',false),

('bi-cp-dashboard','A stakeholder asks for a dashboard to answer a one-off question. What do you do?','Easy','Data','Business Intelligence','mcq',
 'The question is specific and unlikely to recur.','','','',
 '[{"label":"A","text":"Build it — dashboards are always useful."},
   {"label":"B","text":"Answer the question, and offer a dashboard only if the decision will recur."},
   {"label":"C","text":"Refuse and send the raw table."},
   {"label":"D","text":"Build it and add it to a folder of similar dashboards."}]'::jsonb,'B',false),

('bi-cp-perf','A dashboard over a billion-row fact table takes 40 seconds. Best first move?','Medium','Data','Business Intelligence','mcq',
 'Charts are simple; the model queries raw facts live.','','','',
 '[{"label":"A","text":"Reduce the number of charts."},
   {"label":"B","text":"Pre-aggregate nightly at the grain the report displays, and drill through for detail."},
   {"label":"C","text":"Increase the tool''s memory allocation."},
   {"label":"D","text":"Load all data into the tool and filter client-side."}]'::jsonb,'B',false),

('bi-cp-translate','"Are we doing well in the east?" — what is your first response?','Medium','Data','Business Intelligence','mcq',
 'The sponsor wants an answer today.','','','',
 '[{"label":"A","text":"Build a regional dashboard with every available metric."},
   {"label":"B","text":"Ask what decision follows the answer, which fixes the metric, the grain and the comparison."},
   {"label":"C","text":"Report total revenue for the east region."},
   {"label":"D","text":"Ask which chart type they prefer."}]'::jsonb,'B',false)
ON CONFLICT (slug) DO NOTHING;

WITH m(qslug, tslug) AS (VALUES
 ('de-cp-elt','etl-vs-elt'),('de-cp-idempotent','orchestration-and-idempotency'),
 ('de-cp-watermark','batch-vs-streaming'),('de-cp-skew','distributed-processing'),
 ('de-cp-ordering','event-streams'),('de-cp-smallfiles','storage-formats-and-lakehouse'),
 ('de-cp-quality','data-quality-and-contracts'),('de-cp-scd','dimensional-modelling'),
 ('bi-cp-semantic','semantic-layer'),('bi-cp-metric','metric-definition'),
 ('bi-cp-dashboard','dashboard-design'),('bi-cp-perf','report-performance'),
 ('bi-cp-translate','translating-business-questions'))
INSERT INTO public.topic_questions (topic_id, question_id, role, order_index)
SELECT t.id, q.id, 'checkpoint', 0 FROM m
JOIN public.topics t ON t.slug=m.tslug JOIN public.careerprep_questions q ON q.slug=m.qslug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_questions tq WHERE tq.topic_id=t.id AND tq.question_id=q.id);

UPDATE public.topics SET status='published'
WHERE slug IN ('etl-vs-elt','orchestration-and-idempotency','batch-vs-streaming','distributed-processing',
 'event-streams','storage-formats-and-lakehouse','data-quality-and-contracts','dimensional-modelling',
 'semantic-layer','metric-definition','dashboard-design','report-performance','translating-business-questions');

SELECT (SELECT count(*) FROM public.topics WHERE status='published') AS published,
       (SELECT count(*) FROM public.topic_sections) AS sections,
       (SELECT count(*) FROM public.topic_questions WHERE role='checkpoint') AS checkpoints;
