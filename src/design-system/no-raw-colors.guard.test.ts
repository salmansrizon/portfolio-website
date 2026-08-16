import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Enforces ADR-0002: all color in src/ resolves to a semantic design token.
 *
 * See docs/adr/0002-all-color-comes-from-semantic-tokens.md. This repo has run
 * the "tokens by convention" experiment once already — the M0–M8 rollout swept
 * these same colors onto tokens and 391 raw usages had accumulated again by the
 * time ADR-0002 was written. Hence a guard rather than a habit.
 */

const srcDir = path.resolve(__dirname, '..');

const PALETTE = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
].join('|');

const RAW_PALETTE_CLASS = new RegExp(
  `\\b(?:bg|text|border|from|to|via|ring|fill|stroke|decoration|outline|shadow|accent|caret|divide|placeholder)-(?:${PALETTE})-\\d{2,3}\\b`,
  'g',
);

const HEX_LITERAL = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

/**
 * Files still carrying raw colors, each waiting on the sweep ticket that owns
 * its surface. This list only ever shrinks — each sweep deletes its own entries,
 * and it should be empty when the theme-token map (#82) closes.
 */
const NOT_YET_SWEPT: string[] = [
  // Public site — #70
  'components/BlogCarousel.tsx',
  'components/Contact.tsx',
  'components/CourseCountdown.tsx',
  'components/FloatingContact.tsx',
  'components/Navbar.tsx',
  'components/PaymentModal.tsx',
  'components/Services.tsx',
  'components/Testimonials.tsx',
  'components/WebinarFloatingButton.tsx',
  'components/roadmap/RoadmapAccordionView.tsx',
  'components/ui/chart.tsx',
  'components/ui/toast.tsx',
  'pages/BookSession.tsx',
  'pages/CourseDetails.tsx',
  'pages/CoursesPage.tsx',
  'pages/NotFound.tsx',
  'pages/WebinarLanding.tsx',
  // Admin panel — #84
  'components/admin/CareerPrepManager.tsx',
  'components/admin/ContentEditor.tsx',
  'components/admin/CourseEnrollmentManager.tsx',
  'components/admin/CourseManager.tsx',
  'components/admin/CourseReviewManager.tsx',
  'components/admin/DashboardOverview.tsx',
  'components/admin/InstructorManager.tsx',
  'components/admin/SessionBookingManager.tsx',
  'components/admin/StudentManager.tsx',
  'components/admin/TestimonialsManager.tsx',
  'components/admin/WebinarManager.tsx',
  'pages/Admin.tsx',
  // CareerPrep / SQLChallenge — #85
  'pages/CareerPrep.tsx',
  'pages/SQLChallenge.tsx',
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => /\.tsx?$/.test(entry) && !/\.(test|spec)\.tsx?$/.test(entry))
    .map((entry) => path.join(dir, entry));
}

interface Violation {
  file: string;
  line: number;
  match: string;
}

function violationsIn(file: string): Violation[] {
  const relative = path.relative(srcDir, file);
  const found: Violation[] = [];

  readFileSync(file, 'utf8').split('\n').forEach((text, index) => {
    for (const pattern of [RAW_PALETTE_CLASS, HEX_LITERAL]) {
      for (const [match] of text.matchAll(pattern)) {
        found.push({ file: relative, line: index + 1, match });
      }
    }
  });

  return found;
}

const allViolations = sourceFiles(srcDir).flatMap(violationsIn);

function report(violations: Violation[]): string {
  const shown = violations.slice(0, 20);
  const lines = shown.map((v) => `  ${v.file}:${v.line}  ${v.match}`);
  if (violations.length > shown.length) {
    lines.push(`  …and ${violations.length - shown.length} more`);
  }
  return `\n${lines.join('\n')}\n\nUse a semantic token instead (see docs/adr/0002). If the color has no token, add a named one to src/index.css.`;
}

describe('ADR-0002: no raw colors outside the token layer', () => {
  it('has no raw palette classes or hex literals in unswept files', () => {
    const offenders = allViolations.filter((v) => !NOT_YET_SWEPT.includes(v.file));

    expect(offenders.length, report(offenders)).toBe(0);
  });

  it('keeps the allowlist honest — every entry still has a violation to excuse', () => {
    const dirty = new Set(allViolations.map((v) => v.file));
    const stale = NOT_YET_SWEPT.filter((file) => !dirty.has(file));

    expect(stale, `allowlisted files that are already clean — delete them: ${stale.join(', ')}`)
      .toEqual([]);
  });
});
