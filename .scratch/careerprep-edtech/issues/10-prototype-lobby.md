# 10 — Prototype: personalized Career Prep lobby

Type: prototype
Status: open
Blocked by: 03, 08

## Question

What does the redesigned `/career-prep` landing state look like?

Build a rough, reactable prototype covering:

- The personalized state: recommended Roadmap, next checkpoint, streak/XP/level display, daily challenge.
- The 2-question intake — inline, modal, or progressive? — and its skip path.
- The cold-start state for a guest who skipped intake.
- How Roadmaps and the browse library coexist on one page without either burying the other.
- Where the moderate cross-sell surfaces sit (course, webinar, ebook) without becoming banner noise.
- The signed-in versus guest difference.

Constraints: existing tokens only — Ink, Paper, Action Blue, Mint, Magenta, Pill buttons, flat surfaces. Current page is `src/pages/CareerPrep.tsx` (713 lines) — the shuffle-on-load behaviour and the existing course carousel are both up for replacement.

Link the prototype from this ticket rather than pasting it.
