import { describe, it, expect, beforeEach } from "vitest";
import * as guestIdentity from "./guestIdentity";

describe("guestIdentity", () => {
  beforeEach(() => localStorage.clear());

  it("current() reflects an unidentified guest by default", () => {
    expect(guestIdentity.current()).toEqual({
      isGuest: false,
      email: null,
      whatsapp: null,
      lastActive: null,
    });
  });

  it("identify() marks the guest and records contact info", () => {
    guestIdentity.identify({ email: "a@b.com", whatsapp: "+8801712345678" });
    expect(guestIdentity.current()).toMatchObject({
      isGuest: true,
      email: "a@b.com",
      whatsapp: "+8801712345678",
    });
  });

  it("touch() records the current time as lastActive", () => {
    const before = Date.now();
    guestIdentity.touch();
    const { lastActive } = guestIdentity.current();
    expect(lastActive).not.toBeNull();
    expect(new Date(lastActive!).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("sessionId() creates one on first call and reuses it thereafter", () => {
    const first = guestIdentity.sessionId();
    expect(first).toMatch(/^[a-z0-9]+$/);
    const second = guestIdentity.sessionId();
    expect(second).toBe(first);
  });

  it("sessionId() persists across module accessors (backed by the same key)", () => {
    const id = guestIdentity.sessionId();
    expect(localStorage.getItem("careerprep_session_id")).toBe(id);
  });
});
