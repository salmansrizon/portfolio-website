// Guest identity module: the one place that reads/writes the five
// CareerPrep localStorage keys tracking an unauthenticated Candidate.
// No behavior change from the four call sites this replaces — just one
// seam instead of hand-read key literals scattered across files.

const KEYS = {
  isGuest: "careerprep_guest",
  email: "careerprep_guest_email",
  whatsapp: "careerprep_guest_whatsapp",
  sessionId: "careerprep_session_id",
  lastActive: "careerprep_guest_last_active",
} as const;

export interface GuestIdentity {
  isGuest: boolean;
  email: string | null;
  whatsapp: string | null;
  lastActive: string | null;
}

/** The guest's current identity as stored in this browser. */
export function current(): GuestIdentity {
  return {
    isGuest: localStorage.getItem(KEYS.isGuest) === "true",
    email: localStorage.getItem(KEYS.email),
    whatsapp: localStorage.getItem(KEYS.whatsapp),
    lastActive: localStorage.getItem(KEYS.lastActive),
  };
}

/** Marks the guest gate as passed, recording contact info from the gate form. */
export function identify({ email, whatsapp }: { email: string; whatsapp: string }): void {
  localStorage.setItem(KEYS.isGuest, "true");
  localStorage.setItem(KEYS.email, email);
  localStorage.setItem(KEYS.whatsapp, whatsapp);
}

/** Records guest activity now, for the streak calculation. */
export function touch(): void {
  localStorage.setItem(KEYS.lastActive, new Date().toISOString());
}

/** The stable per-browser session id, created on first use. */
export function sessionId(): string {
  let id = localStorage.getItem(KEYS.sessionId);
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(KEYS.sessionId, id);
  }
  return id;
}
