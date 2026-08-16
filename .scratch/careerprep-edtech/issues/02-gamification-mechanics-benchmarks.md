# 02 — Gamification mechanics benchmarks

Type: research
Status: open
Blocked by:

## Question

What do the mechanics we've committed to actually look like in products that run them well, and what are the known failure modes?

Specifically:

- **Streak + freeze**: how freeze earning/spending is modelled (earned vs granted vs purchased), timezone handling for "a day", and what happens on a broken streak (reset to zero vs decay).
- **XP curves and levels**: common curve shapes, how many levels before it stops mattering, and whether XP-per-action should vary by difficulty.
- **Daily challenge**: deterministic global selection patterns, and how products avoid repeating or serving an already-solved item.
- **Certificate verification**: the prevailing pattern for a public verify page, and the exact LinkedIn "Add to profile" URL parameters (`certId`, `certUrl`, `organizationId`/`organizationName`, issue date fields).
- **Known failure modes**: where gamification measurably backfires — grinding over learning, badge inflation, streak anxiety.

Deliverable: concrete mechanic specs we can lift, plus the failure modes to design against. Cite sources.
