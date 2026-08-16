# 07 — Guest-to-account merge flow

Type: grilling
Status: open
Blocked by: 05

## Question

Guest progress migrates on signup — "claim your solves" is the pitch that makes the soft wall convert. Design the flow.

- What identifies a guest across a session, and what happens when `localStorage` is cleared, or the same person uses two devices/browsers?
- `careerprep_guests` already captures email + WhatsApp. If that email later signs up, is the guest record auto-linked, or does linking require an explicit claim?
- What if the email captured as a guest belongs to an *existing* account — merge, reject, or attach?
- Which artifacts migrate: submissions, XP, streak history, intake answers, ebook unlocks, funnel events?
- Does a migrated streak survive intact, or restart? (A guest streak is unverifiable — decide whether that matters.)
- What does the claim UI say and when does it fire?
- What happens to unclaimed guest records over time?

Deliverable: merge rules, the conflict matrix, and the claim-prompt copy and timing.
