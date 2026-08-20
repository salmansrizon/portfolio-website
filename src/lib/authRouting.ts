// Where a signed-in visitor belongs, given what is known *so far*.
//
// Extracted from the pages because the interesting part is the "not yet known"
// state: an admin check is asynchronous, and acting on an unresolved answer is
// what sent a real admin to the home page right after signing in.

export interface AuthRoutingState {
  /** Any session at all, including the anonymous one every visitor gets. */
  hasUser: boolean;
  isAnonymous: boolean;
  /** False while the is_admin() answer for THIS user is still outstanding. */
  adminChecked: boolean;
  isAdmin: boolean;
}

/** Destination after a successful sign-in, or null to stay put and wait. */
export function postSignInTarget(s: AuthRoutingState): string | null {
  if (!s.hasUser || s.isAnonymous) return null;
  if (!s.adminChecked) return null;
  return s.isAdmin ? '/admin' : '/';
}

/** Whether the admin panel should bounce this visitor, or wait for the answer. */
export function shouldRejectFromAdmin(s: AuthRoutingState): boolean {
  if (!s.adminChecked) return false;
  return !s.isAdmin;
}
