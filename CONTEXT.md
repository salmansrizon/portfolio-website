# Portfolio Website

Personal portfolio and course platform: public-facing marketing, course, and booking pages, plus an admin panel for managing site content (projects, testimonials, courses, bookings, career-prep questions), backed by Supabase.

## Language

**Entity Config**:
A declarative description of one admin-manageable entity — its table, validation schema, default sort, and form fields. One Entity Config exists per entity (Project, Testimonial, Course, Certification, etc.) and drives both its Repository and, where adopted, its Entity Manager.
_Avoid_: schema, model, entity definition

**Repository**:
The seam between an admin screen and Supabase for a single Entity Config — find/create/update/delete, with caching and invalidation handled behind it.
_Avoid_: data layer, adapter (adapter is the concrete thing satisfying the seam, not the seam itself), service

**Entity Manager**:
The shell that gives an admin screen create/edit/delete/search behavior for a single Entity Config, so the screen doesn't hand-roll dialog state, toast copy, or delete confirmation itself. An Entity Manager owns behavior, not layout — it doesn't render the list of items. Only adopted by screens that are flat CRUD over one entity, backed by a Repository; a Composite Screen never adopts one.
_Avoid_: CRUD manager, resource manager, admin manager

**Entity Form Dialog**:
The shared, presentation-only dialog that renders a form from an Entity Config's fields. It has no knowledge of Repositories or toasts — whatever consumes it (an Entity Manager, or a Composite Screen) decides what happens with the submitted data.
_Avoid_: form modal, edit dialog

**Composite Screen**:
An admin screen whose data can't come from one Repository's `useFindAll` — it needs a join (enrollments with their course), several tables fetched together (the session-booking dashboard), or nested/hierarchical structure (course content and sections, career-prep's parent/child question tree). Fetches directly against Supabase and hand-rolls its own state, deliberately outside both the Repository seam's single-table shape and the Entity Manager shell. Examples: Course Manager, Session Booking Manager, Career Prep Manager, Course Enrollment Manager.
_Avoid_: composite manager, dashboard, custom screen

**Editor Screen**:
An admin screen backed by a Repository for a single Entity Config — its data fits the flat, single-table shape fine — but whose create/edit UI is too specialized for Entity Form Dialog (a rich content editor, a nested block builder), so it hand-rolls its own form instead. Distinct from a Composite Screen, where it's the *data* that breaks the single-entity shape; here it's the *form*. Examples: Blog Manager (delegates to a dedicated content editor), Webinar Manager (nested content-block builder).
_Avoid_: custom screen, specialized manager
