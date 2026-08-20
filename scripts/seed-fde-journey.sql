-- Forward Deployed Engineer: a Journey for the role that barely existed two
-- years ago and is now one of the fastest-growing titles in the industry.
--
-- Researched Aug 2026 (daily.dev, Uplers, Exponent, HeroHunt, NexusIT): a hybrid
-- of software engineering, consulting and product ownership, embedded with a
-- customer to make AI work in their environment. Skills from ~1,000 postings:
-- Python 66%, AI agents 35%, TypeScript 35%, AWS 32%, LLMs 31%. Postings up
-- roughly 1,165% year on year against a candidate pool up ~50%.
--
-- The Topics deliberately skip "learn Python" — that is a prerequisite, not the
-- role. What makes an FDE is everything between a working model and a customer
-- who trusts it: integration, messy data, permissions, latency, and saying no
-- to the wrong request in a room full of stakeholders.

INSERT INTO public.topics (slug, title, what_it_is, why_it_matters, how_it_works, analogy, status) VALUES

('fde-role-shape', 'What a Forward Deployed Engineer actually does',
 'A software engineer embedded with a customer, writing production code inside their environment to make an AI product work there.',
 'It is the job title growing fastest in applied AI, and the one most often misunderstood as either sales engineering or consulting. Knowing which parts are yours — and which are not — is the difference between shipping and being a very expensive support ticket.',
 'You sit between the product team and one customer. Half the week is engineering: integration code, data pipelines, evaluation harnesses. The other half is discovery, demos and explaining tradeoffs to people who will never read the code. You own the outcome, not a ticket queue, which means the problem is yours until the customer is getting value.',
 'A chef sent to open a restaurant abroad. The recipes are proven; the ovens, the ingredients and the local palate are not, and nobody back home can fix that from a distance.',
 'draft'),

('fde-discovery-and-scoping', 'Discovery and scoping',
 'Turning "we want AI" into one problem worth solving first, with a definition of done both sides can check.',
 'Most failed deployments were scoped wrong, not built wrong. A vague brief guarantees a demo that impresses and a rollout that stalls, and the cost lands on you because you are the one embedded.',
 'Interview the people who do the work, not only the people who bought the software. Find the task done many times a day with a measurable outcome. Write down what success looks like in numbers before writing code, agree what is out of scope in the same sentence, and get both in front of the sponsor. If nobody can name the metric, the project has no finish line.',
 'A builder who insists on drawings before laying brick. The conversation is uncomfortable once; the alternative is uncomfortable every week until handover.',
 'draft'),

('fde-legacy-integration', 'Integrating with systems you did not build',
 'Wiring a modern AI service into infrastructure that is a decade old, undocumented, and cannot be changed for you.',
 'This is where the majority of deployment time actually goes. The model works; the customer''s SSO, their firewall, their SOAP endpoint and their change-approval board are the project.',
 'Start by mapping the auth story — service accounts, token lifetimes, who approves them — because it blocks everything else. Prefer pull over push where you cannot get inbound access. Wrap every external system in an adapter with a timeout and a fallback, so their outage is a degraded feature rather than yours. Assume every interface will be undocumented and verify behaviour against the real system rather than its spec.',
 'Fitting a new appliance in an old building. The device is fine; the wiring, the socket and the landlord are the work.',
 'draft'),

('fde-messy-data', 'Data as you find it',
 'Real customer data: inconsistent, duplicated, partly missing, and full of local conventions nobody documented.',
 'Model quality is bounded by input quality, and no prompt fixes a field that means three different things across two departments. Discovering this in week six is the difference between a rollout and a rewrite.',
 'Profile before you build: nulls per column, cardinality, format variants, duplicates, date ranges. Sample by hand — a hundred rows read by a person finds things no profiler flags. Write the cleaning as an explicit, testable step rather than burying fixes in prompts, and treat every rule you add as a fact you learned about the business.',
 'Cooking with what is in someone else''s fridge. The recipe assumed fresh; you have got half a jar of something unlabelled and a deadline.',
 'draft'),

('fde-permissions-and-tenancy', 'Permissions, tenancy and data boundaries',
 'Making sure each user sees only what they are entitled to — through a system that reads documents on their behalf.',
 'It is the failure that ends contracts. A retrieval system that ignores permissions will happily quote the salary review of the person asking about holiday policy, and no amount of quality elsewhere survives that.',
 'Filter at retrieval time by the requesting user''s permissions rather than after generation — once a chunk is in the prompt it is disclosed. Carry the permission attributes in chunk metadata so filtering is a query condition, not a post-check. Keep tenants separated by the strictest boundary the contract allows, and test with a low-privilege account rather than an admin one, because admins see everything and prove nothing.',
 'A librarian fetching books for a reader with a restricted pass. The check happens at the shelf, not after the book is on the table.',
 'draft'),

('fde-latency-and-reliability', 'Latency and reliability in someone else''s environment',
 'Meeting a response-time expectation across a chain of systems you only partly control.',
 'A correct answer that arrives after the user has moved on has not been delivered. In an embedded deployment the slow link is usually theirs, and "their network" is not an answer you can give a sponsor.',
 'Budget the latency end to end and measure each hop — their auth, their data source, retrieval, the model, your glue. Set timeouts everywhere and decide what a timeout returns, because the default is a spinner forever. Cache what is stable, stream what is long, and degrade to something useful when a dependency is down rather than failing the whole request.',
 'A delivery promise that depends on three couriers. You cannot make them faster, so you quote honestly, track each leg, and have a plan for the one that fails.',
 'draft'),

('fde-demo-to-production', 'From demo to production',
 'The gap between an impressive pilot and a system people use on a Tuesday without being asked.',
 'Pilots succeed and roll-outs stall, and the reason is rarely technical. Adoption is part of the deliverable in this role — a working system nobody uses is indistinguishable from a broken one on the renewal call.',
 'Pick one team and make them successful before widening. Instrument usage from day one so adoption is observable rather than anecdotal. Train the people who will answer questions internally, write the runbook before you need it, and agree who owns the system after you leave — including who gets paged. Plan the handover from the first week, not the last.',
 'Teaching someone to drive rather than driving them around. The second is faster today and leaves them stranded the moment you go home.',
 'draft'),

('fde-communicating-tradeoffs', 'Explaining tradeoffs, and saying no',
 'Translating an engineering constraint into a business decision the room can actually make.',
 'The technical judgement is worth nothing if it does not survive contact with the sponsor. This is the skill that separates an FDE from a strong engineer who cannot be embedded, and it is explicitly screened for in interviews.',
 'Lead with the decision and its consequence, not the mechanism: "we can have it in two weeks at 90% accuracy, or six weeks at 97% — which does your process need?" Give options with costs rather than a verdict. Say no with a reason and an alternative, in writing, at the time — an unrecorded objection becomes your fault later. Never let "possible" be heard as "advisable".',
 'A doctor explaining two treatments. Not "your platelet count is low", but "this one works faster and you will feel worse for a week".',
 'draft')

ON CONFLICT (slug) DO NOTHING;

-- ── Journey and Stage ───────────────────────────────────────────────────────
INSERT INTO public.journeys (title, slug, goal, description, status)
VALUES ('Forward Deployed Engineer', 'forward-deployed-engineer', 'forward_deployed_engineer',
        'The fastest-growing role in applied AI: embedded with a customer, making an AI product work inside their systems, their data and their constraints. Assumes you can already write Python and read an API — the plan covers everything between a working model and a customer who trusts it.',
        'published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.journey_stages (journey_id, title, description, duration_weeks, is_assessable, order_index)
SELECT j.id, 'Deploying AI in the real world',
       'Discovery, integration, messy data, permissions, latency, adoption, and the conversations that decide all of them.',
       10, true, 1
FROM public.journeys j WHERE j.slug = 'forward-deployed-engineer'
  AND NOT EXISTS (SELECT 1 FROM public.journey_stages s WHERE s.journey_id = j.id AND s.order_index = 1);

INSERT INTO public.stage_topics (stage_id, topic_id, order_index)
SELECT s.id, t.id, v.ord
FROM (VALUES
  ('fde-role-shape',1), ('fde-discovery-and-scoping',2), ('fde-legacy-integration',3),
  ('fde-messy-data',4), ('fde-permissions-and-tenancy',5), ('fde-latency-and-reliability',6),
  ('fde-demo-to-production',7), ('fde-communicating-tradeoffs',8)
) AS v(slug, ord)
JOIN public.topics t ON t.slug = v.slug
JOIN public.journey_stages s ON s.journey_id = (SELECT id FROM public.journeys WHERE slug = 'forward-deployed-engineer')
WHERE NOT EXISTS (SELECT 1 FROM public.stage_topics st WHERE st.stage_id = s.id AND st.topic_id = t.id);

SELECT (SELECT count(*) FROM public.topics WHERE slug LIKE 'fde-%') AS fde_topics,
       (SELECT count(*) FROM public.stage_topics st JOIN public.journey_stages s ON s.id=st.stage_id
        WHERE s.journey_id=(SELECT id FROM public.journeys WHERE slug='forward-deployed-engineer')) AS attached;
