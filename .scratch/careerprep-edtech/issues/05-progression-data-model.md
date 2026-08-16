# 05 — Progression and funnel data model

Type: grilling
Status: open
Blocked by: 03, 04

## Question

Design the schema for everything the engagement engine needs, using the vocabulary from ticket 03 and the event taxonomy from ticket 04.

Cover:

- Roadmap↔Question attachment, node ordering, checkpoint definition (single + multi select answers).
- Per-learner progress: node completion, checkpoint results, roadmap completion.
- XP: event log vs materialized counter. Streak is *computed* from submission dates — decide what is stored versus derived, and where the weekly freeze is recorded.
- Certificates: issuance record, public verify id, what is snapshotted at issue time.
- Badges: earned-badge records against a code-defined badge set.
- Guest identity: what a guest is keyed on, and what carries across the merge.
- Intake answers (goal + level) for both guests and users.
- Ebooks: catalogue table + unlock records.
- `funnel_events`.
- Where the existing `careerprep_questions`, `careerprep_submissions`, `careerprep_guests`, `roadmaps` tables fit, and what changes.

Deliverable: table list with columns, keys, and the derived-vs-stored call on every counter.
