# M3 · Website — Catalog & Content Pages

**Type:** Website reskin (no structural change) · **Depends on:** M0, M1 · **Blocks:** —

## Goal
Reskin the catalog and content-consumption pages, preserving current layout, filters, and behavior.

## Context
`CoursesPage` (search + category chips + course/webinar card grid), `BlogPage`/`BlogPostPage` (list + block-rendered reading view), `PortfolioPage` (project cards with expand + demo/source). CourseDetails is already redesigned (reference).

## In scope
- `CoursesPage`: restyle hero/search, filter chips (shared chip style), and cards; keep filter logic, webinar-first ordering, countdowns.
- `BlogPage` + `BlogPostPage`: reskin list cards and reading column (strong measure, `CategoryBadge`, mono code blocks); keep block renderer.
- `PortfolioPage`: reskin project cards; keep expand/collapse and demo/source actions.

## Out of scope
- Changing filter behavior, pagination, or the blog block model.
- CourseDetails (already shipped).

## Affected files
`src/pages/CoursesPage.tsx`, `BlogPage.tsx`, `BlogPostPage.tsx`, `PortfolioPage.tsx`.

## Acceptance criteria
- [ ] All three page types restyled; filters/search/expand behavior unchanged.
- [ ] Category colors match the shared series palette.
- [ ] Loading skeletons updated to new surfaces.
- [ ] Light + dark + responsive verified; `tsc`/`build` pass.

## Verification
Playwright screenshots: `/courses` (with a filter applied), `/blog`, a blog post, `/portfolio` — light + dark.

## Size
M.
