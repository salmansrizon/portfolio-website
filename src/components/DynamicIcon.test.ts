import { describe, expect, it } from 'vitest';
import { resolveIconName, ICON_NAMES } from './DynamicIcon';

/**
 * The admin stores `services.icon` as free text, so any lucide name can reach
 * this — which is how an empty icon disc shipped: a hand-maintained three-entry
 * map silently returned undefined for everything else.
 */
describe('resolveIconName', () => {
  it('accepts the PascalCase names stored historically', () => {
    expect(resolveIconName('Database')).toBe('database');
    expect(resolveIconName('Brain')).toBe('brain');
    expect(resolveIconName('ChartBar')).toBe('chart-bar');
  });

  it('accepts lucide kebab-case directly', () => {
    expect(resolveIconName('chart-bar')).toBe('chart-bar');
  });

  // lucide renamed the chart family (BarChart3 -> chart-bar) and keeps the old
  // PascalCase names only as component aliases, not as dynamic-import keys. A
  // service still storing "BarChart3" resolves to null and renders the fallback
  // rather than an empty disc, which is the behaviour that matters.
  it('falls back rather than resolving a renamed legacy alias', () => {
    expect(resolveIconName('BarChart3')).toBeNull();
  });

  it('tolerates surrounding whitespace from a free-text admin field', () => {
    expect(resolveIconName('  Database  ')).toBe('database');
  });

  it('returns null for an unknown name so the caller can fall back', () => {
    expect(resolveIconName('NotARealIcon')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(resolveIconName('')).toBeNull();
    expect(resolveIconName(null)).toBeNull();
    expect(resolveIconName(undefined)).toBeNull();
  });

  it('exposes the full lucide set, not a hand-maintained subset', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(1000);
    expect(ICON_NAMES).toContain('database');
  });
});
