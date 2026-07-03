# M7 · Admin — Manager Restyle, Batch A (content editors)

**Type:** Admin restyle + UI optimization (features preserved) · **Depends on:** M0, M6 · **Blocks:** —

## Goal
Rebuild the content-heavy managers on the shared admin components (from M6), preserving every field, action, and behavior. Optimization = consistency + less duplicated table/form markup, **not** feature removal.

## Context
These managers carry the richest UIs: course CRUD, section/lesson builders, blog editor. Today each hand-rolls its own table/form/card.

## In scope (managers)
- `CourseManager`, `CourseContentManager`, `SectionEditor`, `ContentEditor`, `BlogManager` + `BlogEditor`, `WebinarManager`, `RoadmapManager`.
- Rebuild each on `PageHeader` + `DataTable` + `FormField`/`Drawer` where applicable; keep all fields, validations, uploads, drag-order, and Supabase calls.

## Out of scope
- Data-model/schema changes; new fields or features.
- Changing editor engines (rich text / code editor).

## Affected files
`src/components/admin/CourseManager.tsx`, `CourseContentManager.tsx`, `SectionEditor.tsx`, `ContentEditor.tsx`, `BlogManager.tsx`, `BlogEditor.tsx`, `WebinarManager.tsx`, `RoadmapManager.tsx`.

## Acceptance criteria
- [ ] Each manager restyled on shared components; **feature parity** (every existing field/action present and working).
- [ ] Create/edit/delete/publish flows verified per manager.
- [ ] Light + dark verified; `tsc`/`build` pass.

## Verification
Per manager (mocked Supabase): list renders, open create/edit form, save path fires with correct payload; screenshot light + dark.

## Size
L (batched for review; each manager is an isolated change).

## Task checklist
- [ ] CourseManager
- [ ] CourseContentManager
- [ ] SectionEditor
- [ ] ContentEditor
- [ ] BlogManager + BlogEditor
- [ ] WebinarManager
- [ ] RoadmapManager
