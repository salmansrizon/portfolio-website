# M8 · Admin — Manager Restyle, Batch B (records & commerce)

**Type:** Admin restyle + UI optimization (features preserved) · **Depends on:** M0, M6 · **Blocks:** —

## Goal
Rebuild the remaining, mostly table-shaped managers on the shared admin components, preserving every feature. This is the batch where the shared `DataTable`/`FormField` pays off most.

## Context
These managers are largely list + form CRUD over records and commerce data; today each duplicates table/form markup.

## In scope (managers)
- Commerce: `CourseEnrollmentManager`, `PromoCodeManager`, `SessionBookingManager`.
- People/records: `InstructorManager`, `StudentManager`, `CourseReviewManager`.
- Content taxonomy/records: `CourseCategoryManager`, `CertificationsManager`, `ServicesManager`, `TestimonialsManager`, `ProjectManager`, `BrandLogosManager`, `CareerPrepManager`, `UnavailableSlotsManager`.
- Rebuild each on `PageHeader` + `DataTable` + `FilterBar` + `FormField`/`Drawer`; keep all fields, filters, approve/verify actions, and Supabase calls (incl. promo scope/usage logic).

## Out of scope
- Schema changes; new features (e.g. roles). Enrollment/promo business logic unchanged.

## Affected files
`src/components/admin/{CourseEnrollmentManager,PromoCodeManager,SessionBookingManager,InstructorManager,StudentManager,CourseReviewManager,CourseCategoryManager,CertificationsManager,ServicesManager,TestimonialsManager,ProjectManager,BrandLogosManager,CareerPrepManager,UnavailableSlotsManager}.tsx`.

## Acceptance criteria
- [ ] Each manager restyled on shared components with **feature parity**.
- [ ] Status/approve/verify actions and filters still work (e.g. review approval, enrollment status, promo active/scope).
- [ ] Light + dark verified; `tsc`/`build` pass.

## Verification
Per manager (mocked Supabase): list + filters render, create/edit/delete + any state action fires correctly; screenshot light + dark.

## Size
L (batched; each manager isolated).

## Task checklist
- [ ] CourseEnrollmentManager
- [ ] PromoCodeManager
- [ ] SessionBookingManager
- [ ] InstructorManager
- [ ] StudentManager
- [ ] CourseReviewManager
- [ ] CourseCategoryManager
- [ ] CertificationsManager
- [ ] ServicesManager
- [ ] TestimonialsManager
- [ ] ProjectManager
- [ ] BrandLogosManager
- [ ] CareerPrepManager
- [ ] UnavailableSlotsManager
