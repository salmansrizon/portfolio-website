# Portfolio Website

Personal portfolio and course platform: public-facing marketing, course, and booking pages, plus an admin panel for managing site content (projects, testimonials, courses, bookings, career-prep questions), backed by Supabase.

## Language

**Entity Config**:
A declarative description of one admin-manageable entity — its table, validation schema, default sort, and form fields. One Entity Config exists per entity (Project, Testimonial, Course, Certification, etc.) and drives both its Repository and, where adopted, its Entity Manager.
_Avoid_: schema, model, entity definition

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
A multiple-choice Question (`question_type: 'mcq'`) with options A–D and one `correct_option`. No SQL execution required to answer.
_Avoid_: quiz, multiple choice question

**Case Study**:
A SQL Question framed in a localized business scenario (`question_type: 'case_study'`), executed and validated like a Single Question.

**Mission**:
A container Question (`question_type: 'root'`) whose ordered child Questions (linked via `parent_id`) form one continuous investigation — each step builds on the previous (day 1 → day N), all children are Single-style code questions on the same dataset.
_Avoid_: mission-based question (a Mission is the container, not one question)

**Question Type Colour**:
A Question's kind is shown in the Series palette rather than a palette of its own — Mission root reads as `series-webinar`, Single Question as `series-web`, MCQ as `series-data`, Case Study as `series-career`. Difficulty is a *status*, not a kind, so Easy/Medium/Hard read as success/warning/danger.
_Avoid_: difficulty colour (it names one of the two scales, not both)
