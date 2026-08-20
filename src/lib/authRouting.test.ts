import { describe, it, expect } from 'vitest';
import { postSignInTarget, shouldRejectFromAdmin } from './authRouting';

const base = { hasUser: true, isAnonymous: false, adminChecked: true, isAdmin: false };

describe('postSignInTarget', () => {
  it('sends an admin to the admin panel', () => {
    expect(postSignInTarget({ ...base, isAdmin: true })).toBe('/admin');
  });

  it('sends a normal account home', () => {
    expect(postSignInTarget(base)).toBe('/');
  });

  it('waits while the admin answer is still outstanding', () => {
    // The regression: acting here routes an admin home on a stale `isAdmin`.
    expect(postSignInTarget({ ...base, adminChecked: false, isAdmin: false })).toBeNull();
  });

  it('ignores the anonymous session every visitor holds', () => {
    expect(postSignInTarget({ ...base, isAnonymous: true })).toBeNull();
  });
});

describe('shouldRejectFromAdmin', () => {
  it('rejects a non-admin once the answer is in', () => {
    expect(shouldRejectFromAdmin(base)).toBe(true);
  });

  it('does not reject while the answer is outstanding', () => {
    expect(shouldRejectFromAdmin({ ...base, adminChecked: false })).toBe(false);
  });

  it('admits an admin', () => {
    expect(shouldRejectFromAdmin({ ...base, isAdmin: true })).toBe(false);
  });
});
