-- Case study steps: the same treatment. Each step now carries the state of the
-- investigation at that point — what has been found, what has been ruled out,
-- what the numbers are — so the decision is made from evidence rather than
-- guessed from a sentence.

UPDATE public.careerprep_questions SET
 content_md = E'**Where you are:** six weeks live, ~1 in 5 answers confidently wrong, no deploy in three weeks, corpus grew by ~900 documents.\n\nYou have full traces: the query, the retrieved chunk ids with scores, the assembled prompt, and the answer. You have one afternoon.\n\nA colleague suggests immediately rewriting the system prompt to demand accuracy. Another wants to upgrade the model. Both are one-line changes.\n\n**Where do you actually start?**',
 hints = '["A fix chosen before the diagnosis is a guess with a deploy attached.","You have the retrieved chunk ids for every wrong answer. Use them.","Ask whether the model ever had the right information in front of it."]'::jsonb
WHERE slug = 'cs-rag-triage-1';

UPDATE public.careerprep_questions SET
 content_md = E'**What you found:** in 80% of the wrong answers, the chunk containing the correct information was **not in the top 5**. In half of those it was not in the top 50 either.\n\nSo for most failures, the model was asked a question and handed context that did not contain the answer — and answered anyway.\n\n**What does that finding rule out as the primary cause?**',
 hints = '["The model can only use what it was given.","If the right chunk never arrived, no prompt change puts it there.","This tells you which half of the system to spend the afternoon in."]'::jsonb
WHERE slug = 'cs-rag-triage-2';

UPDATE public.careerprep_questions SET
 content_md = E'**The new documents:** the 900 additions are release notes — short, highly similar to one another, and dense with version numbers like `v4.11.2`.\n\n**The pattern:** questions about older, stable documentation have got worse since they landed. Questions about the release notes themselves work fine.\n\nRetrieval returns 5 chunks. For a failing older question, 4 of the 5 returned chunks are release notes.\n\n**What is the mechanism?**',
 hints = '["Nothing about the old documents changed. What changed around them?","Many near-identical chunks all score moderately well against a general query.","There are only five slots, and the release notes are taking four of them."]'::jsonb
WHERE slug = 'cs-rag-triage-3';

UPDATE public.careerprep_questions SET
 content_md = E'**Diagnosis so far:** retrieval fails because near-duplicate release notes crowd the top-k, and version-number queries match badly against embeddings alone.\n\nYou can ship two changes this week. The four candidates on the table:\n\n- a stricter system prompt\n- a larger model\n- raising k from 5 to 50\n- hybrid search (keyword + vector) with a cross-encoder reranker\n\n**Which pair addresses the diagnosis rather than the symptom?**',
 hints = '["Version numbers are rare exact tokens. Which retrieval method is good at those?","Raising k puts more candidates in play, but something still has to order them well.","A stricter prompt cannot conjure a chunk that retrieval never returned."]'::jsonb
WHERE slug = 'cs-rag-triage-4';

UPDATE public.careerprep_questions SET
 content_md = E'**The numbers:** last month $900, this month $2,700. Requests up 20%. Answers are marginally better in an internal review.\n\n**The only change:** retrieved chunks per query went from 4 to 10. Average chunk is ~800 tokens. Average answer is ~250 tokens.\n\n**Do the arithmetic:** what does the input side of one call look like before and after?',
 hints = '["Multiply chunks by tokens per chunk for each case.","Compare that to the ~250 tokens of output.","Traffic rose 20%. The context per call rose by considerably more."]'::jsonb
WHERE slug = 'cs-cost-blowup-1';

UPDATE public.careerprep_questions SET
 content_md = E'**What the quality review showed:** the improvement came from the correct chunk being *present* more often at k=10 than at k=4 — not from the model reading ten chunks.\n\nSo you need the recall of a wide retrieval with the context cost of a narrow one.\n\n**Which change gives you both?**',
 hints = '["Retrieval and generation do not have to see the same number of chunks.","Something can sit between them and reorder candidates cheaply.","Fetch wide, pass narrow."]'::jsonb
WHERE slug = 'cs-cost-blowup-2';

UPDATE public.careerprep_questions SET
 content_md = E'**Second finding:** 30% of this month''s questions were near-duplicates of a question already asked — "what is the refund window", asked forty different ways.\n\nThe corpus is updated weekly by the policy team.\n\n**What do you reach for, and what is the risk you must design around?**',
 hints = '["If the same question was answered an hour ago, the work has already been done once.","Matching by meaning rather than exact string is what makes this useful — and what makes it risky.","The corpus changes weekly. What happens to a stored answer when the policy behind it changes?"]'::jsonb
WHERE slug = 'cs-cost-blowup-3';

UPDATE public.careerprep_questions SET
 content_md = E'**The trace, in order:** `charge_card(order_id=8814, amount=4500)` called → gateway did not respond within 10s → tool returned a timeout error → agent reasoned that the charge had failed → called `charge_card` again with the same arguments → second call succeeded.\n\nThe gateway had processed the first charge. The customer paid ৳9,000 for a ৳4,500 order.\n\n**Where is the defect?**',
 hints = '["The agent did what any caller does with a failed request.","A timeout means the outcome is unknown, not that it failed.","Ask what the tool allows a caller to do twice."]'::jsonb
WHERE slug = 'cs-agent-incident-1';

UPDATE public.careerprep_questions SET
 content_md = E'**Constraint:** the agent must keep the ability to charge — removing the tool means a human does every payment, which is the workflow you were hired to automate.\n\nThe retry itself is desirable: most timeouts genuinely are failures, and retrying recovers them.\n\n**What change makes the retry harmless without removing it?**',
 hints = '["You cannot make the network reliable. You can make a repeat call a no-op.","Payment providers all support a specific header for exactly this.","The second call should return the first call''s result rather than performing a new charge."]'::jsonb
WHERE slug = 'cs-agent-incident-2';

UPDATE public.careerprep_questions SET
 content_md = E'**Post-incident review.** Idempotency is being added. The reviewer asks what else reduces the blast radius of *this class* of incident — an agent taking a real-world action with a wrong or repeated argument.\n\nOn the table: a larger model, more few-shot examples of correct billing conversations, splitting into three specialised agents, or step limits plus per-call authorisation against the signed-in user.\n\n**Which actually contains the damage?**',
 hints = '["The model is not inside your trust boundary. Its output is a request, not an authorisation.","A better model reduces the frequency of mistakes; it does not bound their consequences.","Ask which option would still hold if the model behaved badly on purpose."]'::jsonb
WHERE slug = 'cs-agent-incident-3';

UPDATE public.careerprep_questions SET
 content_md = E'**The plan output, abbreviated:**\n\n```\nSeq Scan on orders  (cost=0.00..980412 rows=1 width=84)\n                    (actual rows=2,140,880 loops=1)\n  Filter: (to_char(created_at, ''YYYY-MM'') = ''2026-01'')\nSubPlan 1 ->  Aggregate (actual rows=1 loops=2,140,880)\n```\n\nYou have one afternoon and an eleven-minute query. Before changing anything, what is the plan telling you to look at?',
 hints = '["Compare `rows=1` (estimated) with `actual rows=2,140,880`.","Look at `loops=2,140,880` on the subplan — that is how many times it ran.","Total cost alone tells you a query is expensive, not where the time goes."]'::jsonb
WHERE slug = 'cs-slow-query-1';

UPDATE public.careerprep_questions SET
 content_md = E'**The filter:** `WHERE to_char(created_at, ''YYYY-MM'') = ''2026-01''`\n\nThere is a valid B-tree index on `created_at`, used by other queries on the same table. The plan shows a sequential scan of all 40 million rows.\n\n**Why is the index unusable here, and what is the rewrite?**',
 hints = '["What exactly does the index contain — the column, or the output of to_char over it?","The planner can only use the index if the query asks about the indexed value itself.","A half-open range on the raw timestamp asks the same question in an index-friendly way."]'::jsonb
WHERE slug = 'cs-slow-query-2';

UPDATE public.careerprep_questions SET
 content_md = E'**The regional share calculation:**\n\n```sql\nSELECT o.customer_id, o.amount,\n       o.amount / (SELECT SUM(amount) FROM orders o2\n                   WHERE o2.region = o.region) AS share\nFROM orders o;\n```\n\nThe subquery references `o.region` from the outer query, and the plan showed it looping 2.1 million times.\n\n**What replaces it?**',
 hints = '["The subquery recomputes the same regional total for every row in that region.","You need a group-level number alongside row-level detail, without collapsing rows.","One partitioned window pass computes each region''s total once."]'::jsonb
WHERE slug = 'cs-slow-query-3';

UPDATE public.careerprep_questions SET
 content_md = E'**After the two fixes** — index-friendly date range and a window function replacing the correlated subquery — the query runs in 9 seconds.\n\nA colleague suggests also adding indexes on every column appearing in any WHERE or JOIN clause across the reporting schema, "while we are in here".\n\nThe tables take 400,000 inserts a day.\n\n**Why is that the wrong move?**',
 hints = '["Both real defects were about how the query was written, not about missing indexes.","Every index must be maintained on every insert, update and delete.","Indexes that no query uses are pure write cost."]'::jsonb
WHERE slug = 'cs-slow-query-4';

UPDATE public.careerprep_questions SET
 content_md = E'**The query, abbreviated:**\n\n```sql\nSELECT date_trunc(''month'', o.created_at) AS m, SUM(o.total_amount)\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nLEFT JOIN refunds r ON r.order_id = o.id\nWHERE i.category = ''electronics''\n  AND r.refunded_at IS NULL\nGROUP BY 1;\n```\n\n**The numbers:** finance ৳4.2 crore, dashboard ৳6.8 crore — 62% too high. The average electronics order contains 1.6 items.\n\n**What explains the overstatement?**',
 hints = '["`total_amount` lives on the order, not on the item.","How many rows does an order with three items produce after the join to order_items?","1.6 items per order. Compare that ratio to the 62% overstatement."]'::jsonb
WHERE slug = 'cs-wrong-dashboard-1';

UPDATE public.careerprep_questions SET
 content_md = E'**Constraint:** the category filter is still required, and `category` only exists on `order_items`. You must not sum an order''s total more than once.\n\nSomeone proposes `SELECT DISTINCT` over the whole query; someone else suggests dividing by the item count.\n\n**What is the correct shape?**',
 hints = '["You need the join for filtering, not for the sum.","There is a way to test for the existence of a matching item without multiplying rows.","Keep the query at order grain and let the filter be a predicate, not a join."]'::jsonb
WHERE slug = 'cs-wrong-dashboard-2';

UPDATE public.careerprep_questions SET
 content_md = E'**The second defect.** Refund exclusion is written as `LEFT JOIN refunds r ... WHERE r.refunded_at IS NULL`, which looks right.\n\nBut in months where the refunds table also gets a `WHERE r.status = ''processed''` condition added by a later edit, orders that were **never refunded at all** vanish from the report.\n\n**What is happening?**',
 hints = '["For a never-refunded order, every column of r is NULL after the outer join.","What does `NULL = ''processed''` evaluate to in WHERE?","A condition on the right-hand table in WHERE quietly turns a LEFT JOIN into an INNER JOIN."]'::jsonb
WHERE slug = 'cs-wrong-dashboard-3';

SELECT count(*) AS enriched_steps
FROM public.careerprep_questions
WHERE parent_id IS NOT NULL AND hints IS NOT NULL AND jsonb_array_length(hints) > 0;
