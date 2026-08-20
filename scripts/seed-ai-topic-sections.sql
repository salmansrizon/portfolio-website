-- Sub-topic cards for the AI Engineering Topics: the second layer, where the
-- Topic card gives the shape and these give the substance.
--
-- Three per Topic, chosen by the same rule each time: the mechanism, the
-- decision a working engineer actually faces, and the failure mode that shows
-- up in production. Anything that needed a fourth was usually a Topic of its own.

INSERT INTO public.topic_sections (topic_id, title, body, takeaway, order_index)
SELECT t.id, v.title, v.body, v.takeaway, v.ord
FROM (VALUES

-- ── retrieval-augmented-generation ──────────────────────────────────────────
('retrieval-augmented-generation', 1, 'The two halves: indexing and querying',
 'Indexing happens once per document: split, embed, store. Querying happens on every question: embed the question, retrieve the nearest chunks, put them in the prompt. They are usually written as one pipeline and they fail for completely different reasons — a bad index is a slow, expensive rebuild, while a bad query path is a config change.',
 'When a RAG system is wrong, ask first which half is wrong. The fixes have different costs.'),

('retrieval-augmented-generation', 2, 'Why the model must be told to stay in the context',
 'Handing a model relevant documents does not stop it answering from memory. The prompt has to say the answer must come from the provided sources, that "not in the sources" is an acceptable answer, and that claims should cite. Without that, retrieval quietly becomes a suggestion.',
 'Retrieval supplies the facts; the prompt is what makes the model use them.'),

('retrieval-augmented-generation', 3, 'RAG is not a memory upgrade',
 'A common failure is reaching for RAG to fix tone, format, or reasoning. Retrieval changes what the model can see at query time and nothing else — if the answer is in the context and still wrong, retrieval was never the problem.',
 'RAG changes what the model knows. It cannot change how the model behaves.'),

-- ── embeddings-and-vector-search ────────────────────────────────────────────
('embeddings-and-vector-search', 1, 'Why cosine similarity, and what it misses',
 'Embeddings are compared by angle, not distance, because magnitude carries little meaning and varies with text length. It measures topical closeness — which is why "how do I cancel" and "how do I sign up" score uncomfortably close: both are about account actions, and the embedding has no notion of opposite.',
 'Similar is not the same as relevant, and never the same as opposite.'),

('embeddings-and-vector-search', 2, 'Dimensions, index type, and the memory bill',
 'A 1536-dimension float32 vector is about 6KB. A million chunks is roughly 6GB before the index structure, which is why dimension-reduced models and quantised indexes exist. HNSW is fast and memory-hungry; IVF is lighter and needs tuning of how many lists it probes.',
 'Vector storage cost is a design input, not an afterthought.'),

('embeddings-and-vector-search', 3, 'The model is part of the index',
 'The embedding model used at index time and at query time must match exactly, version included. Changing it invalidates every stored vector, and the symptom is not an error — it is quietly worse results, which is far harder to notice.',
 'Changing embedding model means re-embedding everything. Budget for it before you switch.'),

-- ── chunking-strategy ───────────────────────────────────────────────────────
('chunking-strategy', 1, 'Fixed-size, recursive, and semantic splitting',
 'Fixed-size splits at N tokens and is fast and stupid. Recursive splitting tries paragraph, then sentence, then character, keeping natural boundaries where it can. Semantic chunking splits where the topic actually changes, costs an embedding pass over the document, and pays for itself on long unstructured text.',
 'Start recursive. Move to semantic when retrieval, not the ingestion job, is what hurts.'),

('chunking-strategy', 2, 'Metadata is half the value of a chunk',
 'Every chunk should carry its document title, section heading, and any filterable attribute — product, version, date. It lets you scope retrieval before searching, and it gives the model the context the chunk lost when it was cut out of the page.',
 'A chunk without metadata is a paragraph with no idea where it came from.'),

('chunking-strategy', 3, 'Tables and lists break naive splitters',
 'A table split across chunks becomes rows without headers, which retrieve badly and read worse. The same applies to numbered procedures where step 7 alone is useless. Detect these structures and keep them whole even when that breaks the size target.',
 'Size limits are a guideline. Structure boundaries are not.'),

-- ── hybrid-search-and-query-rewriting ───────────────────────────────────────
('hybrid-search-and-query-rewriting', 1, 'BM25 in one paragraph',
 'The keyword half is usually BM25: it scores a document by how often the query terms appear, discounted by how common each term is across the corpus and normalised for document length. That discount is why it is excellent at rare tokens — error codes, SKUs, surnames — which is exactly where embeddings are weakest.',
 'Keyword search is not a legacy fallback. It is the half that handles rare exact terms.'),

('hybrid-search-and-query-rewriting', 2, 'Fusing two rankings that do not share a scale',
 'A BM25 score of 14 and a cosine similarity of 0.82 are not comparable, so fusing by raw score requires calibration that drifts. Reciprocal rank fusion sidesteps it by using positions instead of scores, which is why it is the common default despite being almost embarrassingly simple.',
 'Fuse by rank, not by score, unless you are prepared to recalibrate forever.'),

('hybrid-search-and-query-rewriting', 3, 'The conversational query problem',
 'In a chat, "does it work on the pro plan too?" is unsearchable — it has no subject. Rewriting resolves pronouns against the conversation before retrieval. It is the single highest-value rewrite in a chat product and the one most often left out.',
 'Retrieval sees one query at a time. Someone has to put the conversation back into it.'),

-- ── rerankers ───────────────────────────────────────────────────────────────
('rerankers', 1, 'Bi-encoder versus cross-encoder',
 'A bi-encoder embeds query and document separately, so document vectors can be computed in advance — that is what makes vector search fast. A cross-encoder feeds query and document through the model together, which lets it model their interaction directly and makes precomputation impossible.',
 'Precomputation is exactly what you trade away for accuracy.'),

('rerankers', 2, 'Choosing the shortlist size',
 'Retrieve too few and the reranker cannot fix what was never returned; retrieve too many and latency and cost climb linearly. Twenty to fifty candidates is the usual working range, and the honest way to pick is to measure recall@k on a golden set and find where it stops improving.',
 'The reranker can only reorder what retrieval found. Recall@k is what tells you how many to fetch.'),

('rerankers', 3, 'When not to use one',
 'A reranker adds 100–300ms and a second model to operate. On a small corpus where recall@5 is already near 1.0, or in a latency budget under half a second, it buys little. It earns its place when retrieval returns roughly-right results and the top-1 is often wrong.',
 'Add a reranker when ordering is the problem, not when retrieval is.'),

-- ── hallucination-and-grounding ─────────────────────────────────────────────
('hallucination-and-grounding', 1, 'Intrinsic versus extrinsic',
 'An intrinsic hallucination contradicts the provided context — the sources said 30 days and the answer says 60. An extrinsic one adds something the context never mentioned. The first is a generation failure you can catch automatically; the second is usually a retrieval gap.',
 'Which kind it is tells you which half of the system to fix.'),

('hallucination-and-grounding', 2, 'Citations as a product feature, not decoration',
 'Requiring the model to cite the chunk behind each claim does three things: it gives the reader a way to check, it makes faithfulness measurable, and it measurably reduces invention because the model must point at something. Citations that do not link anywhere lose all three.',
 'A citation nobody can click is a decoration. A citation that resolves is a control.'),

('hallucination-and-grounding', 3, 'Letting the model say no',
 'Models are trained to be helpful, and answering is more helpful than refusing. Unless the prompt explicitly makes "the sources do not cover this" a good answer — and the product shows it gracefully — the model will fill the gap.',
 'If refusing is not allowed, inventing is the only option left.'),

-- ── rag-evaluation ──────────────────────────────────────────────────────────
('rag-evaluation', 1, 'Building the golden set',
 'Take real questions from logs rather than inventing them, and for each record the correct answer and the chunk that supports it. A hundred is enough to detect regressions; five hundred is enough to compare options. Inventing the questions yourself produces a set your system already passes.',
 'The golden set should come from your users, not from your imagination.'),

('rag-evaluation', 2, 'Retrieval metrics: recall@k and MRR',
 'Recall@k asks whether the right chunk was in the top k at all — it bounds everything downstream, because a chunk that never arrives cannot be used. MRR asks how high it ranked, which is what a reranker moves. Report both: recall tells you if retrieval is possible, MRR tells you if it is convenient.',
 'Recall@k is the ceiling on your whole system. Measure it first.'),

('rag-evaluation', 3, 'LLM-as-judge and its blind spots',
 'Judging with a model scales to thousands of examples for pennies, and it is biased: toward longer answers, toward its own phrasing, and toward confident tone over correctness. Calibrate it against a human-labelled slice, and re-check that calibration whenever the judge model changes.',
 'An unvalidated judge measures agreement with itself.'),

-- ── prompt-engineering ──────────────────────────────────────────────────────
('prompt-engineering', 1, 'Structure beats wording',
 'Role and task first, context clearly delimited, output format stated exactly, constraints repeated at the end. Models attend strongly to the beginning and the end of a prompt, so the middle is where instructions go to be ignored — which is also where most people put them.',
 'Where an instruction sits changes how often it is followed.'),

('prompt-engineering', 2, 'Few-shot examples are specifications',
 'Two or three examples pin down format, tone and edge-case handling more precisely than a paragraph of description. Choose them for coverage rather than typicality: include the awkward case you keep getting wrong, because the model copies patterns rather than reading intent.',
 'Show the edge case you fear. It teaches more than three easy examples.'),

('prompt-engineering', 3, 'Prompts are code without tests',
 'A prompt edited to fix one case silently changes every other case. Keep a small set of inputs with expected outputs and run it on every change — the same golden-set discipline as retrieval, applied to the instruction.',
 'If a prompt change is not measured, it is a guess with good intentions.'),

-- ── fine-tuning-vs-rag ──────────────────────────────────────────────────────
('fine-tuning-vs-rag', 1, 'What fine-tuning is actually good at',
 'Consistent output format, domain tone, a classification boundary the base model keeps getting wrong, and cutting prompt length by baking in instructions. Notice that none of these are facts — facts change, and a fine-tuned fact cannot be updated without retraining.',
 'Fine-tune behaviour. Retrieve facts.'),

('fine-tuning-vs-rag', 2, 'Data quality dominates data volume',
 'A few hundred carefully checked examples routinely beat tens of thousands of scraped ones. Fine-tuning copies whatever is in the data, including its mistakes and its inconsistencies, and the resulting model is confidently wrong in exactly the way the data was.',
 'Fine-tuning amplifies your dataset, flaws included.'),

('fine-tuning-vs-rag', 3, 'They compose',
 'The strongest production systems often do both: a fine-tuned model that reliably answers in the house format and cites correctly, fed by retrieval for the facts. Treating them as a choice is a false dichotomy that interviews use to see whether you have shipped either.',
 'The real question is never "which", it is "what is each fixing".'),

-- ── llm-cost-and-latency ────────────────────────────────────────────────────
('llm-cost-and-latency', 1, 'Where the tokens actually go',
 'In a RAG call the retrieved context usually dwarfs both the question and the answer. Five 800-token chunks is 4,000 input tokens before anyone has said anything, which is why halving the number of retrieved chunks is often the largest cost lever available.',
 'Cut context before you cut models.'),

('llm-cost-and-latency', 2, 'Two kinds of cache',
 'Prompt caching reuses the provider-side computation of a long, unchanging prefix — a system prompt, a fixed instruction block — and is nearly free to adopt. Semantic caching returns a stored answer for a question close enough to one already asked, which is powerful and risks serving a stale or subtly wrong answer.',
 'Prompt caching is safe and boring. Semantic caching needs a staleness policy.'),

('llm-cost-and-latency', 3, 'Perceived latency versus real latency',
 'Streaming does not make generation faster; it makes waiting tolerable by showing the first token in a few hundred milliseconds. Retrieval and reranking happen before the first token, so they are the part the user actually waits through in silence.',
 'Optimise time-to-first-token. That is the number users feel.'),

-- ── agentic-workflows ───────────────────────────────────────────────────────
('agentic-workflows', 1, 'Tool descriptions are the real prompt',
 'The model chooses tools from their names, descriptions and parameter docs. Vague descriptions produce wrong tool choices far more often than a weak model does, and two tools whose descriptions overlap will be confused with each other indefinitely.',
 'Most agent misbehaviour is a documentation bug in the tool definitions.'),

('agentic-workflows', 2, 'Validate arguments before executing',
 'The model produces structured output; it does not produce guaranteed-safe output. Every argument gets validated and every action gets authorised against the actual user, exactly as you would treat a request from a browser — the model is not inside your trust boundary.',
 'Treat tool arguments as untrusted input, because that is what they are.'),

('agentic-workflows', 3, 'Multi-agent is a cost, not a feature',
 'Splitting work across specialised agents multiplies the failure surface, the latency and the debugging effort, while each handoff loses context. One well-instrumented agent with good tools beats three that nobody can trace, and the second agent should have to earn its place.',
 'Add the second agent when one is provably not enough — not before.'),

-- ── llmops-and-monitoring ───────────────────────────────────────────────────
('llmops-and-monitoring', 1, 'Log the whole trace',
 'The answer alone is unactionable. Store the question, the rewritten query, the retrieved chunk ids and scores, the final prompt, the model and version, tokens, latency and cost. When a user reports a bad answer, that record is the difference between reproducing it and guessing.',
 'You cannot debug an answer you cannot reconstruct.'),

('llmops-and-monitoring', 2, 'Drift comes from three directions',
 'The corpus changes as documents are added and go stale; the questions change as users find new uses; and the model changes underneath you when a provider updates a version. All three degrade quality with no deploy on your side, and only the third gets an announcement.',
 'Pin model versions, and watch the questions as closely as the answers.'),

('llmops-and-monitoring', 3, 'Offline metrics do not settle taste arguments',
 'A change that improves faithfulness by two points may read worse to users. Shadow runs and A/B tests are how quality debates end, and thumbs-down feedback with the trace attached is the cheapest evaluation data you will ever collect.',
 'Ship behind a comparison. Offline numbers open the argument; user behaviour closes it.')

) AS v(topic_slug, ord, title, body, takeaway)
JOIN public.topics t ON t.slug = v.topic_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.topic_sections s WHERE s.topic_id = t.id AND s.title = v.title
);

SELECT count(*) AS sections, count(DISTINCT topic_id) AS topics_covered FROM public.topic_sections;
