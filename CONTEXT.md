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
The shell that gives an admin screen create/edit/delete/search behavior for a single Entity Config, so the screen doesn't hand-roll dialog state, toast copy, or delete confirmation itself. An Entity Manager owns behavior, not layout — it doesn't render the list of items. Only adopted by screens that are flat CRUD over one entity; screens composing multiple entities or nested structure (course content and sections, the session-booking dashboard's several tables, career-prep's parent/child question tree) are hand-rolled instead, deliberately outside an Entity Manager.
_Avoid_: CRUD manager, resource manager, admin manager

**Entity Form Dialog**:
The shared, presentation-only dialog that renders a form from an Entity Config's fields. It has no knowledge of Repositories or toasts — whatever consumes it (an Entity Manager, or a hand-rolled screen) decides what happens with the submitted data.
_Avoid_: form modal, edit dialog
