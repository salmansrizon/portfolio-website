# M4 · Website — Roadmaps & Interactive

**Type:** Website reskin (no structural change) · **Depends on:** M0, M1 · **Blocks:** —

## Goal
Reskin the roadmap pages and the interactive learning surfaces (Career Prep hub + SQL Challenge), keeping all logic and the code editor intact.

## Context
`RoadmapsPage` (path cards) → `RoadmapDetailPage` (markdown parsed into a node tree/accordion). `CareerPrep` is a gamified hub (categories, question types, difficulty, XP/streak, mission cards, guest modal). `SQLChallenge` is a Monaco-based mission runner (prompt/schema/submission tabs, run/results).

## In scope
- `RoadmapsPage` + `RoadmapDetailPage` (+ `components/roadmap/*`): restyle cards and the node tree/accordion (milestone spine, completion state); keep markdown parsing.
- `CareerPrep`: restyle XP header (use `GradientPanel`/`StatCard`), filters (shared chips), and mission cards with clearer difficulty coding; keep filtering, XP hooks, guest modal.
- `SQLChallenge`: reskin the shell/tabs/results panel around the Monaco editor; keep the dark editor theme, run/submit, and grading.

## Out of scope
- Changing question logic, XP rules, grading, or the editor engine.

## Affected files
`src/pages/RoadmapsPage.tsx`, `RoadmapDetailPage.tsx`, `src/components/roadmap/*`, `src/pages/CareerPrep.tsx`, `SQLChallenge.tsx`.

## Acceptance criteria
- [ ] Roadmap list + detail restyled; markdown tree still renders.
- [ ] Career Prep filters/XP/mission states restyled; behavior unchanged.
- [ ] SQL Challenge editor runs and grades as before; shell restyled.
- [ ] Light + dark + responsive verified; `tsc`/`build` pass.

## Verification
Playwright: roadmap list + detail; Career Prep with a category filter; open a mission, run a query, screenshot results — light + dark.

## Size
M–L (SQLChallenge is the heaviest).
