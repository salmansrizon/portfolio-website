import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

type MockResponse = { data?: unknown; error?: unknown };
type Call = { method: string; args: unknown[] };

let responseQueue: MockResponse[] = [];
let builders: Array<{ __table: string; __calls: Call[] }> = [];

function nextResponse(): MockResponse {
  return responseQueue.shift() ?? { data: [], error: null };
}

function makeBuilder(table: string) {
  const calls: Call[] = [];
  const builder: any = { __table: table, __calls: calls };
  ["select", "order", "update", "insert", "delete", "eq"].forEach((method) => {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };
  });
  builder.then = (resolve: (v: MockResponse) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(nextResponse()).then(resolve, reject);
  return builder;
}

const fromSpy = vi.fn((table: string) => {
  const b = makeBuilder(table);
  builders.push(b);
  return b;
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (table: string) => fromSpy(table) },
}));

import { useAdminResource } from "./useAdminResource";

describe("useAdminResource", () => {
  beforeEach(() => {
    responseQueue = [];
    builders = [];
    toastSpy.mockReset();
    fromSpy.mockClear();
  });

  it("fetches on mount and populates items", async () => {
    responseQueue = [{ data: [{ id: "1", name: "A" }], error: null }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string; name: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "1", name: "A" }]);
    expect(builders[0].__table).toBe("services");
    expect(builders[0].__calls.map((c) => c.method)).toEqual(["select", "order"]);
  });

  it("save() inserts when there is no editingItem", async () => {
    responseQueue = [{ data: [], error: null }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    responseQueue.push({ data: null, error: null }); // insert
    responseQueue.push({ data: [{ id: "1" }], error: null }); // refresh after save

    await act(async () => {
      const ok = await result.current.save({ title: "New" });
      expect(ok).toBe(true);
    });

    expect(builders[1].__calls[0]).toEqual({ method: "insert", args: [{ title: "New" }] });
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Success", description: "Created successfully!" }),
    );
  });

  it("save() updates when editingItem is set via startEdit", async () => {
    responseQueue = [{ data: [{ id: "1", title: "Old" }], error: null }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string; title: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.startEdit(result.current.items[0]));
    expect(result.current.editingItem).toEqual({ id: "1", title: "Old" });

    responseQueue.push({ data: null, error: null }); // update
    responseQueue.push({ data: [], error: null }); // refresh

    await act(async () => {
      await result.current.save({ title: "New" });
    });

    expect(builders[1].__calls[0]).toEqual({ method: "update", args: [{ title: "New" }] });
    expect(builders[1].__calls[1]).toEqual({ method: "eq", args: ["id", "1"] });
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Success", description: "Updated successfully!" }),
    );
  });

  it("remove() deletes by id and refreshes", async () => {
    responseQueue = [{ data: [{ id: "1" }], error: null }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    responseQueue.push({ data: null, error: null }); // delete
    responseQueue.push({ data: [], error: null }); // refresh

    await act(async () => {
      await result.current.remove("1");
    });

    expect(builders[1].__calls[0]).toEqual({ method: "delete", args: [] });
    expect(builders[1].__calls[1]).toEqual({ method: "eq", args: ["id", "1"] });
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "Deleted" }));
  });

  it("shows an error toast with the server message when save fails", async () => {
    responseQueue = [{ data: [], error: null }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    responseQueue.push({ data: null, error: { message: "duplicate key" } });

    await act(async () => {
      const ok = await result.current.save({ title: "New" });
      expect(ok).toBe(false);
    });

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error", description: "duplicate key", variant: "destructive" }),
    );
  });

  it("shows an error toast when the initial fetch fails", async () => {
    responseQueue = [{ data: null, error: { message: "network down" } }];
    const { result } = renderHook(() =>
      useAdminResource<{ id: string }>({ table: "services", orderBy: { column: "created_at" } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error", description: "Failed to load data", variant: "destructive" }),
    );
  });
});
