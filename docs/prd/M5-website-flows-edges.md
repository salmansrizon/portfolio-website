# M5 · Website — Flows & Edge Pages

**Type:** Website reskin (no structural change) · **Depends on:** M0, M1 · **Blocks:** —

## Goal
Reskin the conversion flows and edge pages, keeping all form/payment logic intact.

## Context
`BookSession` (session type + calendar + slot + details/payment, confirmation state), `WebinarLanding` (countdown hero, registration card, agenda/speakers/FAQ, CTA — uses shared PaymentModal), `Auth` (sign-in/up tabs), `NotFound` (404).

## In scope
- `BookSession`: reskin two-column layout, session-type cards, calendar/slots, payment block, confirmation; keep booking + payment-window logic.
- `WebinarLanding`: tame oversized type into the system scale, reskin countdown/registration/agenda/speakers/FAQ; reuse `GradientPanel` for the CTA; keep content-block rendering and PaymentModal wiring.
- `Auth`: split gradient-brand panel + tabs; keep sign-in/up logic.
- `NotFound`: on-system 404 with gradient numeral and clear routes.

## Out of scope
- Changing booking/payment/auth logic or the PaymentModal contract.

## Affected files
`src/pages/BookSession.tsx`, `WebinarLanding.tsx`, `Auth.tsx`, `NotFound.tsx`.

## Acceptance criteria
- [ ] All four pages restyled; booking, registration, and auth flows still work.
- [ ] PaymentModal (with promo field) unaffected.
- [ ] Light + dark + responsive verified; `tsc`/`build` pass.

## Verification
Playwright: booking flow to confirmation (mocked), webinar landing + open register modal, auth tabs, 404 — light + dark.

## Size
M.
