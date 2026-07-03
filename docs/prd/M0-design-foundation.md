# M0 · Design Foundation & Shared Component Library

**Type:** Foundation · **Depends on:** none · **Blocks:** M1–M8

## Goal
Establish the single source of truth for the new design philosophy — tokens, typefaces, and a small set of reusable presentational components — extending the existing shadcn/HSL system in place (no parallel token set).

## Context
The app already consumes shadcn HSL CSS variables via Tailwind (`bg-background`, `text-primary`, `border-border`, …), and `--primary` is already the philosophy accent (blue ≈ `#3d5fe0`). We **add** to this system rather than replace it, so nothing regresses.

## In scope
- Extend `src/index.css` `:root` and `.dark` with new tokens: surfaces (`--paper`, `--panel`, `--panel-2`), category series (`--series-web/data/career/webinar`), status (`--success/--warning/--danger` + `-soft`/`-foreground`), refined `--shadow-card/-hover/-pop`, and `--gradient-brand`.
- Map new tokens in `tailwind.config.ts` (colors, `fontFamily.sans`/`display`, `boxShadow.pop`, `backgroundImage.gradient-brand`).
- Add typefaces: Bricolage Grotesque (display) + Work Sans (body) via `index.html`; body → `font-sans`, `h1–h4` → `font-display`.
- Shared primitives in `src/components/ui/`: `StatusPill`, `CategoryBadge`, `StatCard`, `SectionHeading`, `GradientPanel`.

## Out of scope
- Any page/manager reskin (those are M1–M8).
- Admin-only components (DataTable, FilterBar, Drawer) — ship in M6 with real consumers.
- Removing/renaming existing tokens.

## Affected files
`src/index.css`, `tailwind.config.ts`, `index.html`, `src/components/ui/status-pill.tsx`, `category-badge.tsx`, `stat-card.tsx`, `section-heading.tsx`, `gradient-panel.tsx`.

## Acceptance criteria
- [ ] New tokens present in both light and dark; existing tokens unchanged in name.
- [ ] `font-sans` = Work Sans, `font-display` = Bricolage; fonts load in build.
- [ ] Five shared primitives exist, typed, and render in both themes.
- [ ] `npx tsc --noEmit` and `npm run build` pass.
- [ ] No visual regression on already-shipped CourseDetails page.

## Verification
`npm run build`; Playwright screenshot of an existing page in light + dark to confirm no regression; render each primitive once.

## Size
S–M (foundational, low risk).
