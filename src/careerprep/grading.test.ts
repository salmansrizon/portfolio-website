import { describe, it, expect } from "vitest";
import { gradeSubmission } from "./grading";

describe("gradeSubmission — Verdict semantics (locked, do not tighten here)", () => {
  it("identical rows in identical order are correct", () => {
    const rows = [{ id: 1, name: "a" }, { id: 2, name: "b" }];
    expect(gradeSubmission(rows, rows).correct).toBe(true);
  });

  it("different values are incorrect", () => {
    const user = [{ id: 1, name: "a" }];
    const solution = [{ id: 1, name: "different" }];
    expect(gradeSubmission(user, solution).correct).toBe(false);
  });

  it("row order is ignored", () => {
    const user = [{ id: 2, name: "b" }, { id: 1, name: "a" }];
    const solution = [{ id: 1, name: "a" }, { id: 2, name: "b" }];
    expect(gradeSubmission(user, solution).correct).toBe(true);
  });

  it("column names are ignored — only positional values are compared", () => {
    const user = [{ user_id: 1, user_name: "a" }];
    const solution = [{ id: 1, name: "a" }];
    expect(gradeSubmission(user, solution).correct).toBe(true);
  });

  it("empty result sets on both sides are correct", () => {
    expect(gradeSubmission([], []).correct).toBe(true);
  });

  it("empty vs non-empty is incorrect", () => {
    expect(gradeSubmission([], [{ id: 1 }]).correct).toBe(false);
  });

  it("null and undefined values are treated as equivalent (JSON coercion)", () => {
    const user = [{ id: 1, note: null }];
    const solution = [{ id: 1, note: undefined }];
    expect(gradeSubmission(user, solution).correct).toBe(true);
  });

  it("differing value types (number vs string) are NOT coerced equal", () => {
    const user = [{ id: "5" }];
    const solution = [{ id: 5 }];
    expect(gradeSubmission(user, solution).correct).toBe(false);
  });

  it("extra or missing rows are incorrect", () => {
    const user = [{ id: 1 }, { id: 2 }];
    const solution = [{ id: 1 }];
    expect(gradeSubmission(user, solution).correct).toBe(false);
  });

  it("duplicate rows must match duplicate-for-duplicate", () => {
    const user = [{ id: 1 }, { id: 1 }];
    const solution = [{ id: 1 }];
    expect(gradeSubmission(user, solution).correct).toBe(false);
  });
});
