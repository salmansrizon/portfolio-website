# 11 — Prototype: solve workspace and checkpoint modal

Type: prototype
Status: open
Blocked by: 03

## Question

What do the practice surfaces look like after the merge?

Build a rough, reactable prototype covering:

- The checkpoint MCQ modal over a Roadmap node: single and multi select, instant grade, what a wrong answer shows, and how the soft gate is communicated so "you can continue" is obvious.
- The solve workspace (`src/pages/SQLChallenge.tsx`, 611 lines) with progression context added — where in the Roadmap you are, what's next, XP earned on success.
- The success state: XP animation, streak update, and the completion-screen cross-sell.
- The failure state and the struggle trigger firing without feeling like an ad interrupting a lesson.
- The soft signup prompt at first successful solve.
- Mobile: Monaco plus a three-pane layout on a phone is the hard case.

Constraints: existing tokens only. Link the prototype from this ticket.
