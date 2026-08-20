-- Further reading, researched Aug 2026. Bias toward primary documentation and
-- genuinely free courses: a reading list of paywalls reads as an affiliate page,
-- and the Topic's own paid course already sits one section below.

INSERT INTO public.topic_references (topic_id, label, url, kind, note, is_free, order_index)
SELECT t.id, v.label, v.url, v.kind, v.note, v.is_free, v.ord
FROM (VALUES
-- SQL core
('joins','PostgreSQL: Table joins','https://www.postgresql.org/docs/current/queries-table-expressions.html','doc','The authoritative description of every join type, including how ON differs from WHERE.',true,1),
('joins','SQLBolt: joins with subqueries','https://sqlbolt.com/lesson/select_queries_with_joins','practice','Short interactive drills — the fastest way to make join syntax automatic.',true,2),
('group-by-aggregation','PostgreSQL: GROUP BY and HAVING','https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP','doc','Why every selected column must be grouped or aggregated, from the source.',true,1),
('group-by-aggregation','SQLZoo: aggregate exercises','https://sqlzoo.net/wiki/SUM_and_COUNT','practice','Drills that force the COUNT(*) versus COUNT(column) distinction.',true,2),
('where-vs-having','PostgreSQL: logical query processing order','https://www.postgresql.org/docs/current/sql-select.html','doc','The clause evaluation order that explains every "why can I not use this here".',true,1),
('null-semantics','PostgreSQL: comparison and NULL','https://www.postgresql.org/docs/current/functions-comparison.html','doc','IS NULL, IS DISTINCT FROM, and why NOT IN with a NULL returns nothing.',true,1),
('window-functions','PostgreSQL: window functions tutorial','https://www.postgresql.org/docs/current/tutorial-window.html','doc','The clearest short explanation of frames anywhere, including the RANGE default.',true,1),
('window-functions','LearnSQL: window functions in PostgreSQL','https://learnsql.com/blog/free-postgresql-course-window-functions/','course','Free interactive course focused purely on windows and frames.',true,2),
('rank-vs-dense-rank','PostgreSQL: window function reference','https://www.postgresql.org/docs/current/functions-window.html','doc','Exact tie behaviour of RANK, DENSE_RANK and ROW_NUMBER side by side.',true,1),
('subqueries-and-ctes','PostgreSQL: WITH queries (CTEs)','https://www.postgresql.org/docs/current/queries-with.html','doc','Includes MATERIALIZED / NOT MATERIALIZED, which settles the "are CTEs slow" argument.',true,1),
('conditional-aggregation','PostgreSQL: aggregate FILTER clause','https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES','doc','The clean form of the SUM(CASE WHEN ...) trick.',true,1),
('dates-in-sql','PostgreSQL: date/time functions','https://www.postgresql.org/docs/current/functions-datetime.html','doc','date_trunc, intervals, and time zone conversion in one place.',true,1),
('union-vs-union-all','PostgreSQL: combining queries','https://www.postgresql.org/docs/current/queries-union.html','doc','Type-compatibility rules for UNION, which is where the silent casts come from.',true,1),
('indexes','PostgreSQL: indexes','https://www.postgresql.org/docs/current/indexes.html','doc','Composite ordering, expression indexes, and when the planner ignores yours.',true,1),
('indexes','Use The Index, Luke','https://use-the-index-luke.com/','article','A whole free book on SQL indexing for developers. The leftmost-prefix chapter is the one to read first.',true,2),
('normalisation','Kimball: dimensional modelling techniques','https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/','article','The standard reference for when to denormalise on purpose.',true,1),

-- AI engineering
('retrieval-augmented-generation','Anthropic: contextual retrieval','https://www.anthropic.com/news/contextual-retrieval','article','A measured writeup of what actually improved retrieval, with numbers.',true,1),
('retrieval-augmented-generation','DeepLearning.AI short courses','https://www.deeplearning.ai/courses/','course','Free short courses built with LangChain, LlamaIndex, Weaviate and others.',true,2),
('embeddings-and-vector-search','Hugging Face: sentence embeddings','https://huggingface.co/blog/getting-started-with-embeddings','doc','How embeddings are produced and compared, with runnable code.',true,1),
('embeddings-and-vector-search','pgvector','https://github.com/pgvector/pgvector','doc','Vector search inside Postgres — HNSW and IVFFlat parameters explained plainly.',true,2),
('chunking-strategy','Pinecone: chunking strategies','https://www.pinecone.io/learn/chunking-strategies/','article','The comparison of fixed, recursive and semantic chunking most teams start from.',true,1),
('hybrid-search-and-query-rewriting','Weaviate: hybrid search','https://weaviate.io/blog/hybrid-search-explained','article','BM25 and vector fusion, including why reciprocal rank fusion is the default.',true,1),
('rerankers','Cohere: rerank','https://docs.cohere.com/docs/rerank-overview','doc','Cross-encoder reranking end to end, with the shortlist-size tradeoff stated.',true,1),
('hallucination-and-grounding','Anthropic: reducing hallucinations','https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations','doc','Practical prompt-level controls, including permitting "I do not know".',true,1),
('rag-evaluation','Ragas: RAG evaluation metrics','https://docs.ragas.io/','doc','Faithfulness, answer relevance and context recall, defined precisely.',true,1),
('prompt-engineering','Prompt Engineering Guide','https://www.promptingguide.ai/','article','The most complete open reference for zero-shot, few-shot, CoT and ReAct.',true,1),
('prompt-engineering','Anthropic prompt engineering docs','https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview','doc','Structure-first guidance from the model provider, with worked examples.',true,2),
('fine-tuning-vs-rag','Hugging Face PEFT','https://huggingface.co/docs/peft/index','doc','LoRA and QLoRA in code, with the adapter concept explained first.',true,1),
('llm-cost-and-latency','Anthropic: prompt caching','https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching','doc','What is cacheable, what it costs, and where the savings actually land.',true,1),
('agentic-workflows','Anthropic: building effective agents','https://www.anthropic.com/research/building-effective-agents','article','The most useful argument anywhere for keeping agent designs simple.',true,1),
('agentic-workflows','Model Context Protocol','https://modelcontextprotocol.io/','doc','An open standard for tool definitions — worth reading for tool design alone.',true,2),
('llmops-and-monitoring','OpenTelemetry GenAI semantic conventions','https://opentelemetry.io/docs/specs/semconv/gen-ai/','doc','The emerging standard for what to log in an LLM trace.',true,1),

-- Data engineering
('etl-vs-elt','dbt: how we structure our projects','https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview','doc','The raw / staging / marts layering, from the tool that popularised it.',true,1),
('orchestration-and-idempotency','Airflow: DAG concepts','https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html','doc','Dependencies, retries, catchup and backfill semantics.',true,1),
('batch-vs-streaming','Flink: event time and watermarks','https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/','doc','The clearest explanation of watermarks and late data in any engine''s docs.',true,1),
('distributed-processing','Spark: performance tuning','https://spark.apache.org/docs/latest/sql-performance-tuning.html','doc','Broadcast thresholds, shuffle partitions and skew handling.',true,1),
('event-streams','Kafka: design and guarantees','https://kafka.apache.org/documentation/#design','doc','Partitions, ordering guarantees and consumer groups, from the source.',true,1),
('storage-formats-and-lakehouse','Apache Iceberg: table spec','https://iceberg.apache.org/spec/','doc','What a table format adds over a folder of Parquet files.',true,1),
('data-quality-and-contracts','dbt: tests','https://docs.getdbt.com/docs/build/data-tests','doc','Uniqueness, not-null, accepted values and freshness as code.',true,1),
('dimensional-modelling','Kimball: four-step dimensional design process','https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/four-4-step-design-process/','article','Declare the grain first — the step everyone skips.',true,1),

-- BI
('semantic-layer','dbt Semantic Layer','https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl','doc','Metrics as version-controlled code, compiled to SQL on request.',true,1),
('semantic-layer','Cube: semantic layer concepts','https://cube.dev/docs/product/introduction','doc','A vendor-neutral explanation of what a semantic layer actually holds.',true,2),
('metric-definition','Metrics layer: metric definitions','https://docs.getdbt.com/docs/build/metrics-overview','doc','Grain, filters and time basis as explicit fields rather than folklore.',true,1),
('dashboard-design','Storytelling with Data blog','https://www.storytellingwithdata.com/blog','article','The best free writing on cutting charts nobody can act on.',true,1),
('report-performance','Power BI: incremental refresh','https://learn.microsoft.com/en-us/power-bi/connect-data/incremental-refresh-overview','doc','Partition-based refresh — the standard fix for slow dashboards.',true,1),
('translating-business-questions','Coursera: SQL interview prep guide','https://www.coursera.org/resources/sql-interview-prep-guide','article','Includes the business-case round, which is where vague asks get scored.',true,1),

-- Forward deployed engineering
('fde-role-shape','Palantir: what is a forward deployed engineer','https://blog.palantir.com/a-day-in-the-life-of-a-palantir-forward-deployed-engineer-45ef2de257b1','article','From the company that invented the title — the day-to-day, not the job ad.',true,1),
('fde-role-shape','Exponent: what is an FDE','https://www.tryexponent.com/blog/what-is-a-forward-deployed-engineer','article','Current scope, skills and interview shape for the role.',true,2),
('fde-permissions-and-tenancy','OWASP: authorization cheat sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html','doc','Entitlement checks done at the data layer rather than the UI.',true,1),
('fde-latency-and-reliability','Google SRE Book: service level objectives','https://sre.google/sre-book/service-level-objectives/','doc','How to turn "it feels slow" into a number both sides can hold.',true,1),
('fde-messy-data','Great Expectations: core concepts','https://docs.greatexpectations.io/docs/core/introduce_expectations/','doc','Profiling and expectation suites for data you did not create.',true,1)
) AS v(topic_slug, label, url, kind, note, is_free, ord)
JOIN public.topics t ON t.slug = v.topic_slug
WHERE NOT EXISTS (SELECT 1 FROM public.topic_references r WHERE r.topic_id=t.id AND r.url=v.url);

-- ── Diagrams on the sections where a picture genuinely helps ────────────────
UPDATE public.topic_sections s SET diagram = v.diagram
FROM (VALUES
 ('retrieval-augmented-generation','The two halves: indexing and querying','flow: Documents > Chunk > Embed > Index'),
 ('chunking-strategy','Fixed-size, recursive, and semantic splitting','compare: Recursive; splits on paragraph then sentence; cheap, predictable | Semantic; splits where meaning changes; costs an embedding pass'),
 ('rerankers','Bi-encoder versus cross-encoder','flow: Query > Vector search (top 20) > Cross-encoder rerank > Top 5 to model'),
 ('rag-evaluation','Retrieval metrics: recall@k and MRR','flow: Golden set > Retrieve > recall@k / MRR > Generate > Faithfulness'),
 ('llm-cost-and-latency','Where the tokens actually go','compare: Input; retrieved context dominates; the larger half in RAG | Output; the answer itself; usually the smaller half'),
 ('agentic-workflows','Tool descriptions are the real prompt','flow: Model picks tool > Validate arguments > Execute > Feed result back'),
 ('etl-vs-elt','Keep the raw layer','stack: Raw — untouched source / Staged — typed and cleaned / Marts — business logic'),
 ('batch-vs-streaming','Late and out-of-order data','compare: Batch; reprocess a whole window; trivially re-runnable | Streaming; process on arrival; needs watermarks for late data'),
 ('distributed-processing','Shuffle is the cost','flow: Read > Filter (cheap) > Shuffle (expensive) > Aggregate > Write'),
 ('event-streams','Ordering is per partition only','flow: Producer > Key chooses partition > Ordered log > Consumer group'),
 ('dimensional-modelling','Declare the grain first','compare: Fact; one row per event at a declared grain; measures | Dimension; descriptive context; changes slowly'),
 ('semantic-layer','Metrics as code','flow: Warehouse > Semantic layer > Dashboard / Notebook / AI agent'),
 ('joins','Join fan-out: the silent double-count','flow: 1 customer row > join orders > 3 rows > SUM counts the customer 3x'),
 ('window-functions','Frames: the part everyone skips','compare: GROUP BY; collapses rows; one row per group | Window; keeps rows; adds a column per row'),
 ('orchestration-and-idempotency','Backfill is the real test','flow: Run for date > Overwrite partition > Re-run safe > Backfill = same code')
) AS v(topic_slug, section_title, diagram)
WHERE s.title = v.section_title
  AND s.topic_id = (SELECT id FROM public.topics WHERE slug = v.topic_slug);

SELECT (SELECT count(*) FROM public.topic_references) AS refs,
       (SELECT count(DISTINCT topic_id) FROM public.topic_references) AS topics_with_refs,
       (SELECT count(*) FROM public.topic_sections WHERE diagram IS NOT NULL) AS diagrams;
