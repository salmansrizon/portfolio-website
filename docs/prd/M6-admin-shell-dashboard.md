# M6 · Admin — Shell & Dashboard

**Type:** Admin restyle + UI optimization (features preserved) · **Depends on:** M0 · **Blocks:** M7, M8

## Goal
Rebuild the admin shell and dashboard on the design philosophy, and introduce the admin-facing shared components that M7/M8 managers will reuse. **All existing features and destinations preserved.**

## Context
`Admin.tsx` is a flat sidebar of ~17 destinations + content switch; `DashboardOverview` shows stat cards, a 30-day views chart, page-performance table, recent activity. Requirement: keep every feature; optimize the UI and reduce duplicated markup.

## In scope
- Restyle `Admin.tsx`: grouped sidebar (Overview / Content / Commerce / People & Settings) keeping **all** current items and the mobile sheet; new topbar; role/profile footer (display only).
- Restyle `DashboardOverview` using `StatCard`/`ChartPanel`; keep all queries and the existing charts (Recharts), category colors from series palette.
- Build reusable admin presentational components (consumed here + by M7/M8): `PageHeader`, `DataTable` (search/sort/paginate/bulk-select, presentational), `FilterBar`, `Drawer`, `EmptyState`, `ChartPanel`.

## Out of scope
- New capabilities (roles/permissions enforcement, notifications, deeper analytics) — display-only placeholders not added unless requested.
- Collapsing managers into one generic screen (explicitly dropped; managers keep their own screens).

## Affected files
`src/pages/Admin.tsx`, `src/components/admin/DashboardOverview.tsx`, new `src/components/ui/` (or `components/admin/ui/`) shared components.

## Acceptance criteria
- [ ] Sidebar grouped, all destinations present, mobile sheet works.
- [ ] Dashboard restyled; every existing query/stat/chart still renders.
- [ ] Reusable admin components exist, typed, themed, and used by the dashboard.
- [ ] Light + dark verified; `tsc`/`build` pass.

## Verification
Playwright (authed/mocked): admin overview light + dark; open mobile sidebar; confirm charts render.

## Size
M–L.
