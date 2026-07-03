# M2 · Website — Home Sections

**Type:** Website reskin (no structural change) · **Depends on:** M0, M1 · **Blocks:** —

## Goal
Reskin the homepage sections onto the new tokens and shared primitives, keeping the exact same sections, order, and content wiring.

## Context
`Index.tsx` composes: Hero → About → Services → BlogCarousel (Featured) → Testimonials → Courses → Contact. Structure is fixed by requirement; only visual treatment changes.

## In scope
- Restyle each section component: `Hero`, `About`, `Services`, `Testimonials`, `Blogs`/`BlogCarousel`, `Courses`, `Contact`, plus `BrandLogos` and `Certifications` if rendered.
- Use `GradientPanel` for hero/CTA, `SectionHeading` for section intros, `CategoryBadge` on course/blog cards, shared `card`/shadow treatment.
- Keep all data fetching, props, and section order untouched.

## Out of scope
- Changing which sections appear or their order (`Certifications` stays commented as today).
- New copy beyond trivial label alignment.

## Affected files
`src/components/Hero.tsx`, `About.tsx`, `Services.tsx`, `Testimonials.tsx`, `Blogs.tsx`, `BlogCarousel.tsx`, `Courses.tsx`, `Contact.tsx`, `BrandLogos.tsx`, `Certifications.tsx`.

## Acceptance criteria
- [ ] Every existing section renders with new styling; order/content unchanged.
- [ ] Hero + CTA use `GradientPanel`; course cards use `CategoryBadge` (series palette).
- [ ] Data fetches (featured blogs, courses, testimonials) still work.
- [ ] Light + dark verified; responsive intact; `tsc`/`build` pass.

## Verification
Playwright full-page screenshot of `/` in light + dark; mobile width check.

## Size
M.
