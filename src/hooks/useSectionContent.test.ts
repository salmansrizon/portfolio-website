import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SECTION_DEFAULTS } from "@/lib/sections";

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

  it("keeps the module's default copy when no published row exists", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useSectionContent("services"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.content).toEqual(SECTION_DEFAULTS.services);
  });

  it("lets database content win over the default when a row exists", async () => {
    maybeSingle.mockResolvedValue({
      data: { content: { title: "What I Offer" } },
      error: null,
    });

    const { result } = renderHook(() => useSectionContent("services"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    // DB title wins; untouched fields keep the module's default
    expect(result.current.content).toEqual({ ...SECTION_DEFAULTS.services, title: "What I Offer" });
  });
});
