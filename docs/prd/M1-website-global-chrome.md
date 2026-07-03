# M1 · Website — Global Chrome

**Type:** Website reskin (no structural change) · **Depends on:** M0 · **Blocks:** —

## Goal
Apply the design philosophy to site-wide chrome so every page inherits the new look: navbar, floating actions, buttons, badges. **No structural/IA change** — same links, same behavior.

## Context
`Navbar.tsx` is a fixed blur bar with the same nav items; `FloatingContact` and `WebinarFloatingButton` are persistent overlays. These frame every public page, so they go first.

## In scope
- Restyle `Navbar` (surfaces, type, active state, CTA button) using new tokens; keep all nav items, hash-link behavior, mobile menu, and `ThemeToggle`.
- Restyle `FloatingContact`, `WebinarFloatingButton` to match.
- Visual pass on shared `Button`/`Badge` usage where the site relies on defaults (no API changes).

## Out of scope
- Adding/removing nav destinations or changing routes.
- Page bodies (M2–M5).

## Affected files
`src/components/Navbar.tsx`, `FloatingContact.tsx`, `WebinarFloatingButton.tsx`, `ThemeToggle.tsx` (visual only).

## Acceptance criteria
- [ ] Navbar uses new tokens/type; identical links, order, and behavior.
- [ ] Mobile menu + hash navigation still work.
- [ ] Floating actions restyled, still functional.
- [ ] Light + dark verified; `tsc`/`build` pass.

## Verification
Playwright: load home, screenshot navbar (light/dark), open mobile menu, click a hash link, confirm scroll.

## Size
S.
