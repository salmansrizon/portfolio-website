# 08 — Personalization rules and cold start

Type: grilling
Status: open
Blocked by: 03

## Question

A guest lands on Career Prep, answers a 2-question skippable intake (goal + level), and gets a personalized state: recommended Roadmap, next checkpoint, relevant course, relevant webinar. Define the rules that produce it.

- What exactly are the two intake questions, and what are their answer options?
- Rule mapping: intake answer → recommended Roadmap, → difficulty band, → which course and which webinar get surfaced.
- **Cold start**: what does a guest who *skips* the intake see? This is the majority case and it must not look broken.
- Returning guest with history but no intake — does behavior override the missing intake?
- What happens when the mapped Roadmap has no published content, or the mapped course is sold out / unpublished? Fallback chain.
- Is the recommendation sticky, or recomputed every visit?
- Where do the existing `roadmaps`, `courses`, `blogs`, `page_views` feed in?

Deliverable: the intake spec, the rule table, and the fallback chain.
