# Portfolio Website

Salman Sakib's portfolio and course platform: public marketing site, course sales with enrollment/promo checkout, and CareerPrep — a browser-based SQL interview-prep platform (PGLite/WASM) for the Bangladesh tech market — all managed through a single admin panel.

## Language

### Design Language (Family system)

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
`#ec1e79` — the course-sales CTA color (replaces the old hardcoded pink).

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

**Question Library**:
The full set of Questions in the database; the founding library is ~200 Questions (~100 Singles, ~40 MCQs, ~20 Case Studies, 8 Missions × 4 code children), Fintech-weighted (35/25/20/20 across Fintech/E-Commerce/Logistics/Telco), English with localized data, difficulty ramping Easy→Medium→Hard.
