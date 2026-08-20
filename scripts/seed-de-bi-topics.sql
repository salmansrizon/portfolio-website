-- Data Engineer and BI Analyst Topics.
--
-- Researched Aug 2026 (DataCamp, Tredence, Algoroq, Interview Pilot for DE;
-- HackerNoon BI-in-the-AI-era, Omni, Holistics, KORE1 for BI). Both loops now
-- test judgement over tool recall: "interviewers care less that you know
-- Airflow, dbt, Spark or Kafka by name and more that you understand
-- reliability, data correctness, tradeoffs and failure modes", and the BI loop
-- has a semantic-layer round because agents now query those metrics directly.
--
-- Nothing here duplicates a SQL Topic. Joins, window functions, indexes,
-- NULL semantics and the rest are ONE Topic each, attached to every Journey
-- that needs them — a second copy would drift within a month and split the
-- learner's progress across two rows that mean the same thing.
--
-- No executable practice: Spark, Kafka and semantic layers have no grader here,
-- so these are assessed by MCQ and case study, which is what the interview
-- round does anyway.

INSERT INTO public.topics (slug, title, what_it_is, why_it_matters, how_it_works, analogy, status) VALUES

-- ── Data Engineer ───────────────────────────────────────────────────────────
('etl-vs-elt', 'ETL, ELT and where transformation belongs',
 'Whether you transform data before loading it into the warehouse, or load it raw and transform inside.',
 'It decides where your logic lives, who can change it, and what you can recover when it is wrong. Modern warehouses made ELT the default, and understanding why is the difference between following a fashion and making a choice.',
 'ETL transforms in flight, so only clean data lands — cheaper storage, and the raw data is gone when a rule turns out to be wrong. ELT lands raw data first and transforms with SQL inside the warehouse, so the source of truth is preserved, transformations are version-controlled and re-runnable, and a fixed rule can be replayed over history. The cost is storage and warehouse compute.',
 'Washing vegetables before they go in the fridge versus keeping them as they came and washing what you cook. The second uses more fridge and lets you change the recipe.',
 'draft'),

('orchestration-and-idempotency', 'Orchestration, retries and idempotency',
 'Scheduling pipelines as a dependency graph, and making every task safe to run twice.',
 'Pipelines fail at 3am — a source is late, an API times out, a node dies. Whether that is a five-minute retry or a data-corruption incident is decided entirely by whether tasks are idempotent.',
 'Tasks form a DAG so dependencies run in order and unrelated branches run in parallel. Every task should produce the same result when re-run: write to a partition you overwrite rather than appending, use MERGE keyed on a business key rather than blind INSERT, and make the run date an explicit parameter so a backfill is the same code as a scheduled run.',
 'A recipe you can restart from any step without doubling the salt. The restart is not the skill; surviving it unchanged is.',
 'draft'),

('batch-vs-streaming', 'Batch, streaming and exactly-once',
 'Processing data in scheduled chunks versus continuously as events arrive — and what "exactly once" really promises.',
 'Streaming is chosen far more often than it is needed, and it costs an order of magnitude more in complexity. Knowing when latency genuinely justifies it, and what the delivery guarantees actually mean, is a standard senior question.',
 'Batch reprocesses a whole window and is trivially re-runnable. Streaming processes events as they arrive and must handle late and out-of-order data — watermarks define how long you wait before closing a window. At-least-once plus idempotent writes gives effective exactly-once; true end-to-end exactly-once needs transactional sinks and offset commits tied to the write.',
 'A daily post round versus a courier per parcel. The courier is faster and you now need a plan for the parcel that arrives after the shop shut.',
 'draft'),

('distributed-processing', 'Distributed processing and data skew',
 'Splitting work across machines, and what happens when the split is uneven.',
 'A job that runs fine on sample data and hangs on production data is almost always skew or shuffle, not volume. This is the debugging question in most Spark rounds.',
 'Data is partitioned across executors; operations that need rows grouped together — joins, group-bys — trigger a shuffle that moves data across the network, which is the expensive part. Skew is when one key holds a disproportionate share, so one task runs while the rest idle. Fixes: broadcast the small side of a join, salt the hot key, or repartition on a better column.',
 'Ten people unloading a lorry where one crate holds 90% of the weight. Nine finish and stand around while one struggles.',
 'draft'),

('event-streams', 'Event streams, partitions and ordering',
 'A durable, replayable log of events that many consumers read independently at their own pace.',
 'It is the backbone of real-time systems, and its guarantees are narrower than people assume — ordering holds within a partition, not across a topic, and that single fact explains most streaming bugs.',
 'A topic is split into partitions; each is an ordered, append-only log. A message key decides its partition, so all events for one customer stay ordered if keyed by customer id. Consumer groups let each partition be read by exactly one consumer in the group, which is how you scale. Consumers track offsets, so replay is re-reading from an earlier offset rather than resending data.',
 'Several tills at a supermarket. Each queue is ordered; there is no global order across queues, and putting a family in the same queue is what keeps their items together.',
 'draft'),

('storage-formats-and-lakehouse', 'Storage formats and the lakehouse',
 'Columnar files plus a table format that adds transactions, schema evolution and time travel on top of object storage.',
 'It is why "data lake" stopped meaning "a folder of files nobody trusts". Format and partitioning decisions determine query cost more than the engine does.',
 'Parquet stores data by column, so a query reading three of forty columns reads three; compression is far better because a column holds one type. Table formats — Iceberg, Delta — add a metadata layer giving atomic commits, schema evolution and snapshot reads. Partitioning by a filtered column lets engines skip whole directories, and over-partitioning creates millions of tiny files that cost more than the scan saved.',
 'A filing cabinet organised by column rather than by page, with an index card at the front recording every change. The card is what makes it a table rather than a pile.',
 'draft'),

('data-quality-and-contracts', 'Data quality, tests and contracts',
 'Automated checks on the data itself — freshness, volume, uniqueness, accepted values — and an agreement with the source that it will not change without warning.',
 'Silent data errors are the expensive kind: the pipeline is green, the dashboard is wrong, and the business acts on it for three weeks. Nobody finds this without tests.',
 'Test at ingest and after each transformation: uniqueness on keys, not-null on required columns, referential integrity, accepted-value sets, freshness thresholds and volume anomaly bounds. Fail loudly and stop the downstream run rather than publishing bad data. A data contract makes the schema and semantics an explicit commitment from the producing team, so a breaking change is caught at their deploy rather than your dashboard.',
 'A smoke alarm rather than a fire report. Both tell you about the fire; only one does it in time.',
 'draft'),

('dimensional-modelling', 'Dimensional modelling for analytics',
 'Organising the warehouse as fact tables of events surrounded by dimension tables of context.',
 'It is the schema that makes a warehouse queryable by people who did not build it, and the vocabulary every BI tool assumes. Getting the grain wrong is the single most expensive modelling mistake.',
 'A fact table holds measurements at one declared grain — one row per order line, say — with foreign keys to dimensions. Dimensions hold descriptive attributes and change slowly; a type-2 slowly-changing dimension keeps history by adding a row with validity dates, so a report of last year uses last year''s customer segment rather than today''s.',
 'A receipt and an address book. The receipt records what happened; the address book explains who, and keeps the old address when someone moves.',
 'draft'),

-- ── BI Analyst ──────────────────────────────────────────────────────────────
('semantic-layer', 'The semantic layer',
 'A governed definition of your metrics, dimensions and relationships, sitting between raw tables and everything that queries them.',
 'It is the 2026 BI interview round, and the reason is new: AI agents now query metrics directly, and an agent given raw tables invents its own definition of revenue. A semantic layer is what makes "revenue" mean one thing whether a dashboard, a notebook or an agent asks.',
 'Metrics, dimensions, joins and access rules are defined once in version-controlled files. Consumers request "revenue by region last quarter" and the layer compiles it to SQL, applying the agreed definition and the entitlement rules. It removes the class of meeting where two dashboards disagree and nobody can say which is right.',
 'A dictionary a whole company agrees to use. Without it, everyone speaks a private language and every meeting starts by translating.',
 'draft'),

('metric-definition', 'Defining a metric people trust',
 'Pinning down exactly what a number counts, excludes and is grained by — before anyone builds it.',
 'Most BI disputes are definition disputes wearing a data costume. "Active users" without a written definition produces four dashboards with four numbers and a meeting to reconcile them.',
 'Write the definition down: the grain, the filters, the time basis, the exclusions, and the owner. Decide the awkward cases explicitly — do refunds reduce revenue in the month of sale or of refund; is a user active on a login or an action. Certify the metric so consumers know which version is blessed, and version the definition so a change to history is visible rather than mysterious.',
 'A recipe with quantities. Everyone can cook "a curry"; only a recipe makes two kitchens produce the same dish.',
 'draft'),

('dashboard-design', 'Dashboard design and when not to build one',
 'Designing for one audience and one decision, and recognising the requests that a dashboard is the wrong answer to.',
 'Most dashboards are opened twice and abandoned. Building them anyway is the most common way BI time is wasted, and "when would you not build a dashboard" is a real interview question.',
 'Start from the decision the viewer makes and the action available to them. One screen, the headline number first, context beneath, detail on demand. Cut every chart nobody can act on. A one-off question deserves an answer, not a dashboard; a monitoring need deserves an alert, not a chart nobody watches; a deep exploration deserves a notebook.',
 'Signage rather than a map on every wall. A driver needs the next junction, not the whole road network.',
 'draft'),

('report-performance', 'Report performance and refresh',
 'Making a dashboard load in seconds when the underlying tables hold billions of rows.',
 'A slow dashboard is an unused dashboard, and the fix is usually in the model rather than the chart. It is the practical half of the BI loop.',
 'Pre-aggregate at the grain the report actually needs rather than querying raw facts live. Use incremental refresh so only new partitions are rebuilt. Push filters into the query rather than loading everything and filtering in the tool, reduce cardinality of high-cardinality columns, and prefer a well-designed star over a wide flat extract that recomputes joins on every render.',
 'Prepping ingredients before service. The cooking is the same; the wait is not.',
 'draft'),

('translating-business-questions', 'Turning a vague ask into a number',
 'Converting "are we doing well in the east?" into a metric, a grain, a comparison and a threshold.',
 'It is the skill that separates a BI analyst from a chart-builder, and the one most explicitly screened for. The analyst who returns with the right question answered beats the one who returns fastest.',
 'Ask what decision follows the answer — that determines the grain and the comparison. Establish the baseline: compared with when, and with what. Agree the definition before building. Then deliver the number with its caveats attached, because a number handed over without its limits will be quoted without them.',
 'A doctor taking a history rather than treating the first symptom mentioned. The presenting complaint is rarely the whole problem.',
 'draft')

ON CONFLICT (slug) DO NOTHING;

SELECT count(*) AS topics_total FROM public.topics;
