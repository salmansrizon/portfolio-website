import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve(__dirname, '../index.css');
const tailwindPath = path.resolve(__dirname, '../../tailwind.config.ts');

// Comments are stripped first so a `/* } */` inside a block can't end it early.
const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const tailwindConfig = readFileSync(tailwindPath, 'utf8');

/**
 * Tokens that are deliberately theme-agnostic: they carry no color, so a `.dark`
 * override would be meaningless.
 */
const THEME_AGNOSTIC = new Set(['--radius']);

function blockFor(selector: string): string {
  // Anchored so `.dark .foo {}` or a compound selector can't be mistaken for the
  // theme block itself: the selector must be the whole rule head.
  const head = new RegExp(`(^|[\\s}])${selector.replace('.', '\\.')}\\s*\\{`, 'm');
  const match = head.exec(css);
  if (!match) throw new Error(`No ${selector} block found in index.css`);

  const open = css.indexOf('{', match.index);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Unbalanced braces in ${selector} block`);
}

function tokensIn(selector: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const [, name, value] of blockFor(selector).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }
  return tokens;
}

const lightTokens = tokensIn(':root');
const darkTokens = tokensIn('.dark');

describe('design tokens', () => {
  it('defines a dark value for every themeable token', () => {
    const missing = [...lightTokens.keys()].filter(
      (name) => !THEME_AGNOSTIC.has(name) && !darkTokens.has(name),
    );

    expect(missing, `tokens defined in :root but not in .dark: ${missing.join(', ')}`).toEqual([]);
  });

  it('does not define dark-only tokens', () => {
    const orphans = [...darkTokens.keys()].filter((name) => !lightTokens.has(name));

    expect(orphans, `tokens defined in .dark but not in :root: ${orphans.join(', ')}`).toEqual([]);
  });

  describe('third-party brand escape hatches', () => {
    // These are contractual provider colors — bKash/Nagad payments, and the
    // social links — so they get named tokens rather than raw classes.
    const brands: Record<string, string[]> = {
      bkash: ['', '-foreground', '-soft', '-soft-foreground'],
      nagad: ['', '-foreground', '-soft', '-soft-foreground'],
      whatsapp: ['', '-hover', '-foreground'],
      telegram: ['', '-hover', '-foreground'],
      linkedin: ['', '-foreground'],
    };

    const tokensFor = (brand: string) =>
      brands[brand].map((suffix) => `--brand-${brand}${suffix}`);

    it.each(Object.keys(brands))('defines every %s token in both themes', (brand) => {
      for (const token of tokensFor(brand)) {
        expect(lightTokens.has(token), `${token} missing from :root`).toBe(true);
        expect(darkTokens.has(token), `${token} missing from .dark`).toBe(true);
      }
    });

    it.each(Object.keys(brands))('exposes %s to Tailwind', (brand) => {
      for (const token of tokensFor(brand)) {
        expect(tailwindConfig, `${token} not mapped in tailwind.config.ts`).toContain(
          `hsl(var(${token}))`,
        );
      }
    });
  });
});
