import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const maybeSingle = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle }),
        }),
      }),
    }),
  },
}));

import { useSectionContent } from "./useSectionContent";

describe("useSectionContent", () => {
  beforeEach(() => maybeSingle.mockReset());

  it("keeps the hardcoded fallback when no published row exists", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() =>
      useSectionContent("services", { title: "Services", subtitle: "Fallback tagline" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.content).toEqual({ title: "Services", subtitle: "Fallback tagline" });
  });

  it("lets database content win over the fallback when a row exists", async () => {
    maybeSingle.mockResolvedValue({
      data: { content: { title: "What I Offer" } },
      error: null,
    });

    const { result } = renderHook(() =>
      useSectionContent("services", { title: "Services", subtitle: "Fallback tagline" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    // DB title wins; untouched fields keep their fallback
    expect(result.current.content).toEqual({ title: "What I Offer", subtitle: "Fallback tagline" });
  });
});
