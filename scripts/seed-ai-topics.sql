-- AI Engineering Topics, drafted from what 2026 AI-engineer interviews and
-- course syllabi actually cover.
--
-- Sources consulted (Aug 2026): Udemy "AI Engineer Bootcamp 2026: LLMs, RAG, AI
-- Agents & Vector DBs" and "The AI Engineer Course 2026"; Scaler's AI
-- Engineering syllabus; gitgood.dev and Interview Coder RAG interview guides;
-- MockExperts' 2026 AI Engineer interview roadmap. They agree on the shape:
-- one round on fundamentals (chunking, embeddings, indexes), one on retrieval
-- depth (hybrid search, reranking, query rewriting), one on evaluation (golden
-- sets, offline metrics, LLM-as-judge), one on production (latency, cost,
-- caching, multi-tenancy).
--
-- All DRAFT. Nothing reaches a learner until published one at a time.
--
-- Honest limit, stated where the learner will meet it: the platform executes SQL
-- only. These Topics are explained and assessed by MCQ, not by running code.

INSERT INTO public.topics (slug, title, what_it_is, why_it_matters, how_it_works, analogy, status) VALUES

('embeddings-and-vector-search', 'Embeddings and vector search',
 'An embedding turns text into a list of numbers positioned so that similar meanings sit close together. Vector search finds the nearest ones.',
 'It is the retrieval half of almost every LLM product in production. Keyword search fails the moment a user asks for "how do I cancel" and the document says "terminating your subscription" — embeddings match meaning rather than spelling.',
 'A model maps each chunk of text to a fixed-length vector. At query time the question is embedded the same way, and the index returns the nearest vectors by cosine similarity. Real indexes are approximate (HNSW, IVF) because exact nearest-neighbour search over millions of vectors is too slow — you trade a little recall for a lot of speed. The embedding model used to index and the one used to query must be the same, or the geometry does not line up.',
 'Arranging a library so books sit near others about the same subject rather than by title. Someone who wants a book about grief can walk to the right shelf without knowing a single title on it.',
 'draft'),

('chunking-strategy', 'Chunking strategy',
 'Splitting documents into pieces small enough to retrieve precisely and large enough to still make sense on their own.',
 'It is the most common cause of a RAG system that "sort of works". Chunks too small lose the context that made them meaningful; too large and the retrieved passage is mostly irrelevant text that dilutes the answer and burns tokens.',
 'The working default in 2026 is semantic chunking of roughly 500–1000 tokens with 10–20% overlap, keeping sections and tables intact rather than splitting mid-structure, and attaching document- and section-level metadata to each chunk so filters and citations work. Overlap exists so a sentence that straddles a boundary is not lost from both sides.',
 'Cutting a recipe book into cards. Cut per sentence and a card reads "stir for two minutes" with no idea what is being stirred. Cut per chapter and you hand someone forty pages when they asked how long to boil an egg.',
 'draft'),

('retrieval-augmented-generation', 'Retrieval-augmented generation (RAG)',
 'Fetching relevant documents at query time and putting them in the prompt, so the model answers from real sources instead of memory.',
 'It is how a general model answers questions about your private, current data without retraining, and it is what makes an answer checkable — you can show the source. The overwhelming majority of production LLM systems are RAG systems.',
 'Ingest: documents are chunked, embedded and indexed. Query: the question is embedded, the top-k chunks retrieved, optionally reranked, then pasted into the prompt with an instruction to answer only from them and cite. The model never learns the data; it reads it each time, which is why updating a document takes effect immediately.',
 'An open-book exam. The model has not memorised the textbook — it is handed the right pages the moment the question is asked, and is told to answer from those pages rather than from what it half-remembers.',
 'draft'),

('hybrid-search-and-query-rewriting', 'Hybrid search and query rewriting',
 'Combining keyword search with vector search, and rewriting the user''s question before searching with it.',
 'Pure vector search is bad at exactly the things that matter most in a business: product codes, error numbers, names, rare acronyms. Keyword search catches those and misses paraphrase. Hybrid catches both, and rewriting fixes the queries that are unsearchable as typed.',
 'Hybrid runs both retrievers and fuses the rankings — reciprocal rank fusion is the common default because it needs no score calibration between two systems that score differently. Query rewriting uses a cheap model call to expand pronouns from the conversation, split a compound question, or generate several phrasings and retrieve for each.',
 'Asking a librarian for "that blue book about the war". A pure keyword search finds nothing; the librarian asks which war, and searches both the catalogue number and the subject shelf.',
 'draft'),

('rerankers', 'Rerankers',
 'A second, slower, more accurate model that re-sorts the retrieved candidates before the LLM sees them.',
 'Vector search is optimised to be fast over millions of documents, which means it is only roughly right. A reranker is where most of the easy quality gain in a RAG system lives — it fixes the ordering that decides what actually reaches the prompt.',
 'Retrieval returns perhaps the top 20 candidates. A cross-encoder then reads each query-document pair together — rather than comparing two pre-computed vectors — and scores relevance directly, and the top 3–5 go to the model. It is far more accurate and far slower, which is exactly why it runs on 20 candidates and not on the whole corpus.',
 'A first sift by CV keywords, then a human actually reading the shortlist. You would not read every application, and you would not hire from the keyword sift alone.',
 'draft'),

('hallucination-and-grounding', 'Hallucination and grounding',
 'A model stating something fluent and false. Grounding is forcing the answer to come from retrieved sources, and showing which ones.',
 'It is the failure that destroys trust fastest, and the one users cannot detect for themselves — a hallucination reads exactly like a correct answer. In a product that gives advice, one confident invention costs more than ten "I do not know"s.',
 'Most hallucination in a RAG system is a retrieval failure wearing a generation costume: the model was given nothing useful and answered anyway. The fixes are therefore mostly upstream — better chunking, hybrid retrieval, reranking — plus a prompt that permits "not in the sources", and citations that let a reader check. Post-hoc verification (a second pass asking whether each claim is supported by the context) catches some of the rest.',
 'A student who did not do the reading and writes a confident essay anyway. Telling them to write better is useless; giving them the right pages, and requiring a page number beside each claim, is what actually fixes it.',
 'draft'),

('rag-evaluation', 'Evaluating a RAG system',
 'Measuring retrieval and generation separately, against a fixed set of questions with known correct sources.',
 'Without it you cannot tell whether a change helped, and RAG systems have many knobs that all feel like improvements. It is also the question that separates people who have built one of these from people who have read about it.',
 'Build a golden set of 100–500 query / answer / source triples from real questions. Measure retrieval with recall@k and MRR — did the right chunk come back at all, and how high. Measure generation with faithfulness (is every claim supported by the retrieved context), answer relevance, and citation accuracy. Keep them separate: a bad answer from perfect retrieval is a prompt problem, and a perfect answer from bad retrieval was luck. LLM-as-judge scales this cheaply but drifts and flatters models like itself, so it needs a human-labelled slice to stay honest.',
 'Testing a delivery service by measuring whether the right parcel was picked up and whether it arrived intact — separately. A single "customer happy?" score tells you something went wrong but never where.',
 'draft'),

('prompt-engineering', 'Prompt engineering',
 'Structuring the instruction, the examples and the context so the model does the task reliably rather than occasionally.',
 'It is the cheapest lever available — no training, no infrastructure — and the difference between a demo and something that behaves the same way on the thousandth call.',
 'Zero-shot states the task; few-shot shows two or three worked examples and is often the single biggest gain; chain-of-thought asks for reasoning before the answer on problems that need steps; ReAct interleaves reasoning with tool calls. Structure matters as much as wording: role and task first, context clearly delimited, output format stated exactly, and constraints repeated at the end where recency helps.',
 'Briefing a capable contractor. "Make it nice" gets you something. A brief with the goal, two examples of work you liked, and the exact format required gets you what you wanted.',
 'draft'),

('fine-tuning-vs-rag', 'Fine-tuning vs RAG',
 'Two different fixes: RAG changes what the model *knows at query time*, fine-tuning changes how it *behaves*.',
 'Choosing wrong is expensive in both directions — teams fine-tune to add facts (which decays and cannot be updated) or bolt on RAG to fix tone (which it does not). Interviewers ask because the reasoning reveals whether you have actually shipped either.',
 'Reach for RAG when the answer depends on data that changes, is private, or must be cited. Reach for fine-tuning when the task needs a consistent format, style or domain behaviour the base model does not have. LoRA and QLoRA make fine-tuning cheap by training small adapter matrices instead of all weights, and DPO aligns preferences without a full RLHF pipeline. The two compose: a fine-tuned model that answers in your house format, fed by retrieval for the facts.',
 'Hiring someone versus handing them a manual. Training changes how they work; the manual changes what they know today. You would not send someone on a six-week course because the price list changed.',
 'draft'),

('llm-cost-and-latency', 'Cost and latency in LLM systems',
 'Tokens are the unit of both. Every prompt design decision is also a cost and speed decision.',
 'It is what turns a working prototype into an unshippable one: a system that costs a dollar a question or answers in twelve seconds is not a product regardless of quality. It is also the constraint that makes RAG design real — context is not free.',
 'Cost scales with input plus output tokens, and input is usually the larger half in RAG because retrieved context dominates. The levers: retrieve fewer and better chunks (this is what the reranker buys you), cache aggressively — prompt caching for repeated system prompts, semantic caching for repeated questions — route easy queries to a smaller model, and stream output so time-to-first-token is short even when the full answer is not.',
 'Freight. You pay by weight and it arrives when it arrives, so you do not ship the whole warehouse to send one parcel — and you keep the things you post every week nearer the door.',
 'draft'),

('agentic-workflows', 'Agentic workflows and tool calling',
 'Letting the model choose actions — call a function, query an API, run a search — in a loop, instead of answering in one shot.',
 'It is how an LLM does things rather than just describes them, and it is where most 2026 product work has moved. It is also where systems become hardest to keep reliable, which is why interviews probe the failure modes rather than the frameworks.',
 'The model is given tool definitions and returns a structured call; your code executes it and feeds the result back, and the loop repeats until the model answers. Reliability comes from the boring parts: narrow tools with clear descriptions, validation of every argument before execution, a step limit so a loop cannot run forever, and idempotent tools so a retry cannot double-charge anyone. Multi-agent setups split roles across models but multiply the failure surface — one well-instrumented agent beats three that nobody can debug.',
 'A junior who can phone the warehouse and the finance system. Useful, and the reason you give them a short list of who they may call, a script, and a rule about not placing the same order twice.',
 'draft'),

('llmops-and-monitoring', 'LLMOps and monitoring',
 'Keeping a deployed LLM system observable: what it was asked, what it retrieved, what it answered, what it cost, and whether that is getting worse.',
 'LLM systems degrade silently. Nothing throws an exception when answers get vaguer, when a document set goes stale, or when a model version changes underneath you — without monitoring the first signal is a user complaint.',
 'Log the whole trace, not just the answer: query, rewritten query, retrieved chunk ids, scores, prompt, model, tokens, latency, cost. Run the golden-set evaluation on every change and on a schedule, so regression is caught by you rather than reported to you. Watch drift in the questions being asked as closely as drift in the answers — a shift in what users want is the most common cause of falling retrieval quality. Ship changes behind A/B or shadow runs, because offline metrics do not settle taste arguments.',
 'A restaurant kitchen with tickets, timings and a tasting spoon. Without them nobody notices the sauce has been getting saltier for a month — the customers just stop coming back.',
 'draft')

ON CONFLICT (slug) DO NOTHING;
