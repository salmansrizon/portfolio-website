# Map: Career Prep as EdTech Engagement Engine

## Destination

A phased written **spec** — domain model, data model, gamification mechanics, personalized journey, funnel design, and redesign direction — for turning Career Prep into the engagement engine that feeds course enrollments. Handed to build sessions; this map builds nothing.

## Notes

**Domain**: EdTech / personal portfolio + course platform. Stack: Vite + React 18 + TS, shadcn/Tailwind, Supabase, Vercel, PGLite (Postgres WASM in browser).

**Skills every session consults**: `grilling` + `domain-modeling` by default; `prototype` for design tickets; `research` for AFK fact-finding.

**Settled during charting** (standing constraints, not up for re-litigation):

- Destination is a spec, not shipped code.
- Scope = Option A: Career Prep is the engine; hooks into *existing* courses / webinars / blogs. No site-wide IA restructure.
- Web only (PWA manifest acceptable). No native app.
- Achievements = public profile `/u/<username>` + verifiable certificate. Public by default, opt-out toggle, username chosen at signup.
- Guest-first. Soft prompt at first *successful* solve; hard wall only on rewards (streak/XP/profile/certificate).
- Guest progress **migrates** into the account on signup ("claim your solves").
- Content: SQL + MCQ + case study. Python out of scope.
- Persona: interview-prepper primary (existing content fits); beginner→interview pipeline as a short free taster, not a full curriculum.
- Primary metric: **course enrollments**. Leads + webinar registrations are intermediate steps.
- Roadmap and Track are **merged** — a Roadmap node gains attached Questions. No new Track entity.
- Checkpoints: auto-graded MCQ in a modal over the Roadmap node. Single + multi select. Never written/essay. Failed checkpoint is a **soft** gate — only the certificate requires all passed.
- Certificate earned by Roadmap completion + timed final assessment (checkpoints, not a written exam).
- Intake: 2 questions (goal + level), skippable.
- Personalization: rules first (phase 1), behavioral layer phase 2.
- Badges: fixed set in code, ~8-10. Not admin-authored.
- Roadmap↔Question authoring lives in the existing Roadmap Manager.
- Ebook: one flagship + admin table for more; in-app unlock after email capture; Supabase Storage signed URL. No email provider.
- Instrumentation: new `funnel_events` table. Not PostHog, not an extension of `page_views`.
- Cross-sell aggression: moderate — completion screen, sidebar, struggle-trigger. No interstitials or exit-intent.
- Streak/XP: computed server-side from submission dates. One freeze per week. Daily challenge is global and deterministic per date.
- Design: reuse existing tokens (Ink / Paper / Action Blue / Mint / Magenta). No new design language.

## Decisions so far

<!-- one line per closed ticket -->

## Not yet specified

- **Beginner taster content** — what the free beginner Roadmap actually teaches, and where it hands off to a paid course. Content-authoring work; shape depends on the merged Roadmap model landing first.
- **Certificate credibility** — whether anything beyond a verify URL is needed (issuer identity, expiry, revocation, anti-share). Revisit once the certificate prototype exists.
- **Phase 2 behavioral personalization** — the weak-topic inference model. Needs `funnel_events` + submission history shape settled.
- **Migration path for existing `careerprep_questions` rows** into the merged Roadmap model. Sharpens once the schema lands.
- **Admin analytics surface** — what the funnel dashboard shows once `funnel_events` exists.

## Out of scope

- **Leaderboard / weekly league** — needs ~100 weekly actives to not look dead. Revisit as a separate effort when traffic supports it.
- **Newsletter infrastructure** — recurring content obligation plus an email provider. Schema should leave room; building it is a later effort.
- **Python track / Pyodide** — ruled out for this map. The free-tier feasibility question is folded into [01 — Free-tier ceilings](issues/01-free-tier-ceilings.md) so the path is known, not walked.
- **Site-wide IA restructure** — Option B was declined in favour of Option A.
- **Native / app-store app** — would discard the browser-side PGLite architecture.
- **Admin-authored badges** — a CMS for something that changes twice a year.
