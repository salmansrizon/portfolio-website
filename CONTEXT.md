# Portfolio Website

Personal portfolio and course platform: public-facing marketing, course, and booking pages, plus an admin panel for managing site content (projects, testimonials, courses, bookings, career-prep questions), backed by Supabase.

## Language

**Entity Config**:
A declarative description of one admin-manageable entity — its table, validation schema, default sort, and form fields. One Entity Config exists per entity (Project, Testimonial, Course, Certification, etc.) and drives both its Repository and, where adopted, its Entity Manager. Written with `defineEntityConfig<T>()({ … })`, which checks the table name and every schema field against the generated Supabase types at compile time — a plain `: EntityConfig<T>` annotation widens the table back to "any table" and loses that check.
_Avoid_: schema, model, entity definition

**Stored Row / Parsed Post**:
Two shapes of the same record. A **stored row** is what the Repository returns — one table's columns, exactly as the generated Supabase types describe them, with JSON columns still strings. A **parsed post** (or parsed record) is what a screen works in after the boundary has validated and decoded those columns — the Blog editor's `content` blocks, for instance. Parsing happens once, at the handoff; nothing downstream re-guesses.
_Avoid_: DTO, model, domain object

**Repository**:
The seam between an admin screen and Supabase for a single Entity Config — find/create/update/delete, with caching and invalidation handled behind it.
_Avoid_: data layer, adapter (adapter is the concrete thing satisfying the seam, not the seam itself), service

**Entity Manager**:
The shell that gives an admin screen create/edit/delete/search behavior for a single Entity Config, so the screen doesn't hand-roll dialog state, toast copy, or delete confirmation itself. An Entity Manager owns behavior, not layout — it doesn't render the list of items. Only adopted by screens that are flat CRUD over one entity, backed by a Repository; a Composite Screen never adopts one.
_Avoid_: CRUD manager, resource manager, admin manager

**Entity Form Dialog**:
The shared, presentation-only dialog that renders a form from an Entity Config's fields. It has no knowledge of Repositories or toasts — whatever consumes it (an Entity Manager, or a Composite Screen) decides what happens with the submitted data.
_Avoid_: form modal, edit dialog

**Composite Screen**:
An admin screen whose data can't come from one Repository's `useFindAll` — it needs a join (enrollments with their course), several tables fetched together (the session-booking dashboard), or nested/hierarchical structure (course content and sections, career-prep's parent/child question tree). Fetches directly against Supabase and hand-rolls its own state, deliberately outside both the Repository seam's single-table shape and the Entity Manager shell. Examples: Course Manager, Session Booking Manager, Career Prep Manager, Course Enrollment Manager.
_Avoid_: composite manager, dashboard, custom screen

**Editor Screen**:
An admin screen backed by a Repository for a single Entity Config — its data fits the flat, single-table shape fine — but whose create/edit UI is too specialized for Entity Form Dialog (a rich content editor, a nested block builder), so it hand-rolls its own form instead. Distinct from a Composite Screen, where it's the *data* that breaks the single-entity shape; here it's the *form*. Examples: Blog Manager (delegates to a dedicated content editor), Webinar Manager (nested content-block builder).
_Avoid_: custom screen, specialized manager

### Design Language (Family system)

**Design Token**:
A named color, radius, or shadow that components refer to by the *meaning* they want (`bg-success-soft`) rather than by its hue. A token family is a base color, the ink that sits on it (`-foreground`), an optional tinted background (`-soft`), and the ink that sits on that (`-soft-foreground`).
_Avoid_: variable, theme color, CSS var

**Ink**:
The near-black neutral (`#131313`, surfaces `#1c1c1c`) used for text and dark surfaces; the dark theme is derived from it.
_Avoid_: black, charcoal

**Paper**:
The warm white canvas (`#ffffff`, muted `#f5f4f1`) every light surface sits on.
_Avoid_: white, background (too generic)

**Action Blue**:
`#2f7eff` — the site's primary interactive color (a deliberate deviation from Family's ink-primary buttons).

**Mint**:
`#00d26a` — success and special-CTA color.

**Magenta**:
`#ec1e79` — the course-sales CTA color.

**Provider Brand**:
The contractual color of a third party the site links to or takes money through — bKash, Nagad, WhatsApp, Telegram, LinkedIn. Owned by that provider rather than by this design system, so each gets its own token family instead of being approximated by the nearest palette color, and none of them may be restyled to fit the palette.
_Avoid_: pink, orange, payment brand (the social links have one too — it names the hue or too narrow a subset, not the provider)

**Pill**:
The fully-rounded button shape; every button is a Pill. Cards use 14px (small) / 20px (prominent) radii. Surfaces are flat — no gradients or glow.

### Site Content

**Section**:
A named block of the public homepage (hero, about, contact, services, portfolio, testimonials, certifications, teaching). Its editable copy lives in `portfolio_sections`; the JSX ships matching hardcoded copy only as a fallback when no row exists.
_Avoid_: page, block

### Course Pricing

**Sale Pricing**:
The default pricing mode of a course: the admin-set `discounted_price` is displayed and charged; promo codes are not accepted for the course.

**Promo-Only Pricing**:
The opt-in pricing mode (per-course toggle): the course lists at full `price`, and the only possible discount is a promo code applied at checkout. The two modes are mutually exclusive — a discount never stacks on another discount.
_Avoid_: apply promo (ambiguous — names the toggle, not the rule)

### CareerPrep

**Question**:
One row in `careerprep_questions`. Every type of prep content — single, MCQ, case study, mission root or child — is a Question.

**Single Question**:
A standalone SQL coding question (`question_type: 'code'`) solved in the Monaco/PGLite workspace with no parent.
_Avoid_: coding question, challenge

**MCQ**:
A multiple-choice Question (`question_type: 'mcq'`) with options A–D and one or more correct options. No SQL execution required to answer. Authors default to single-answer; multi-answer is opt-in.
_Avoid_: quiz, multiple choice question

**Case Study**:
A SQL Question framed in a localized business scenario (`question_type: 'case_study'`), executed and validated like a Single Question.

**Mission**:
A container Question (`question_type: 'root'`) whose ordered child Questions (linked via `parent_id`) form one continuous investigation — each child builds on the one before (day 1 → day N), all children Single-style code questions **on the same dataset**. A Mission is finished in one sitting; the shared dataset is what makes it one exercise rather than a list. Distinct from a Roadmap, which is a curriculum returned to over weeks.
_Avoid_: mission-based question (a Mission is the container, not one question), track, path

**Visitor Id**:
The single durable anonymous identifier for one browser, a `crypto.randomUUID()` held in `localStorage`. Everything a person does before signing up is keyed on it, and it is what an account claims on signup. There is exactly one — the older per-feature random ids it replaces were unjoinable, which made attribution impossible.
_Avoid_: session id (that is the per-visit id, a different thing), guest id, anonymous id

**Struggle Trigger**:
The moment a learner is judged stuck on one Question — two failed submissions, or ten minutes on it. Fires the highest-intent cross-sell on the site, because being stuck is the clearest evidence someone wants what the paid courses teach. The time arm exists because failure count alone misses the learner staring at a blank editor.
_Avoid_: stuck event, frustration signal

**Surface**:
A named place in the product that can carry one offer — the completion screen, the lobby sidebar, the Struggle Trigger, the certificate page. A Surface shows at most one offer at a time, chosen by fixed priority.
_Avoid_: slot, placement, banner

**Journey**:
An admin-authored career plan — an ordered list of Stages that together get a learner to one job title, with a duration set per Stage so the end date is visible on day one. The author's expert opinion about how to reach that job *is* the product, which is why a Journey is never generated or learner-assembled. Only careers the platform can actually assess get one.
_Avoid_: track, program, path, curriculum

**Enrolment**:
One learner's run through a Journey — their start date, schedule, and position in it. The Journey is the template; the Enrolment is the instance. A learner has one active Enrolment at a time; switching archives it rather than resetting, because progress is stored per Step and carries across Journeys that share Roadmaps.
_Avoid_: journey progress, subscription, registration (a Course Enrollment is a paid thing and spelled differently)

**Roadmap**:
A standalone written reference for one career: the role description, the topic sequence, and the timeline, authored as a single markdown document and read end to end. It is **not** interactive and carries no Questions, Checkpoints or progress — Career Prep covers the same subject matter in a different medium and for a different purpose. A Roadmap is where a Journey's Topics and their order *come from* — an authoring input, not a runtime dependency — and a Stage may link out to one for the learner who wants the full map.
_Avoid_: track, learning path, curriculum, course (a Course is paid and lives elsewhere)

**Step**:
One heading in a Roadmap's markdown. Steps nest as the headings nest and give the document its structure; they are identified by an author-stable `{#slug}` in the heading rather than by position, so inserting a heading above does not renumber the ones below. A Step is reading material only — progress, Checkpoints and Questions belong to Topics in Career Prep, not to Steps.
_Avoid_: node (a data-structure word), lesson (implies taught content), milestone, topic (a Topic is the Career Prep unit and a different thing)

**Checkpoint**:
The one MCQ Question that closes a Topic. Auto-graded and graded in the database, never written or human-marked. Passing it is what "completing a Topic" means; the Topic's other Questions are practice, tracked separately. A failed Checkpoint is a soft gate: the learner may carry on, and only the certificate requires every Checkpoint passed.
_Avoid_: quiz, gate, test

**Topic**:
One thing a learner learns, and the unit Career Prep is built from: an explanation (what it is, why it matters, how it works, a plain analogy), a set of practice Questions, and at most one Checkpoint. A Topic is not a Roadmap Step and does not belong to a Roadmap — the same Topic serves every Journey that needs it.
_Avoid_: concept (the earlier name for the explainer half), lesson, module, node

**Topic Card**:
How a Topic's explanation renders where the learner already is — a tab in the solve workspace, and the first thing shown after a failed Checkpoint. Never gates anything and never awards XP: it is free help, not progress. On a failed Checkpoint it takes priority over the offer on that Surface, so the first failure explains and only a repeat failure sells.
_Avoid_: concept card, info box, hint (a hint is per-Question and progressive)

**Stage**:
One phase of a Journey — a title, a duration in weeks, and an ordered list of Topics. Stages are what give a Journey its visible timeline and realistic end date. A Stage may link to a Roadmap for the learner who wants the full written map, but it does not depend on one and renders fine without it.
_Avoid_: phase, module, chapter, roadmap (a Roadmap is a separate reference document)

**Library**:
The browsable, filterable surface over every Question, independent of any Roadmap. Secondary to Roadmaps as a landing surface, but retained because an interview candidate with a screening next week wants to drill a category directly. A Question attached to a Step is still in the Library — one Question, one solve record, many surfaces.
_Avoid_: question bank, catalogue, list

**Question Type Colour**:
A Question's kind is shown in the Series palette rather than a palette of its own — Mission root reads as `series-webinar`, Single Question as `series-web`, MCQ as `series-data`, Case Study as `series-career`. Difficulty is a *status*, not a kind, so Easy/Medium/Hard read as success/warning/danger.
_Avoid_: difficulty colour (it names one of the two scales, not both)
