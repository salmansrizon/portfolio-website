import { describe, it, expect } from 'vitest';
import { getPGliteInstance, isPGliteReady } from './PGliteEngine';

// PGlite is a real WASM database — booting it repeatedly inside a vitest
// worker exhausts the worker's heap and crashes the run. The boot/seed/query
// path is verified against a real browser instead (see ticket #73's manual
// smoke test and the Playwright UAT pass), not with unit tests here.
describe('PGliteEngine', () => {
  it('is not ready before any instance has been booted in this process', () => {
    expect(isPGliteReady()).toBe(false);
    expect(getPGliteInstance()).toBeNull();
  });
});
