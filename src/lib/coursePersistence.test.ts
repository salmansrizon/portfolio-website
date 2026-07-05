import { describe, it, expect, vi, beforeEach } from "vitest";

type MockResponse = { data?: unknown; error?: unknown };
type Call = { method: string; args: unknown[] };

let responseQueue: MockResponse[] = [];
let builders: Array<{ __table: string; __calls: Call[] }> = [];
let rpcCalls: Array<{ fn: string; args: unknown }> = [];

function nextResponse(): MockResponse {
  return responseQueue.shift() ?? { data: null, error: null };
}

function makeBuilder(table: string) {
  const calls: Call[] = [];
  const builder: any = { __table: table, __calls: calls };
  ["select", "insert", "update", "eq", "single"].forEach((method) => {
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
const rpcSpy = vi.fn((fn: string, args: unknown) => {
  rpcCalls.push({ fn, args });
  return Promise.resolve(nextResponse());
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (table: string) => fromSpy(table), rpc: (fn: string, args: unknown) => rpcSpy(fn, args) },
}));

import { saveCourse, enrollStudent, type CourseDraft } from "./coursePersistence";

const draft: CourseDraft = {
  title: "SQL Bootcamp",
  description: "Learn SQL",
  short_description: "SQL",
  price: 1000,
  discounted_price: null,
  discount_percentage: null,
  is_free: false,
  promo_only: false,
  status: "published",
  difficulty_level: "beginner",
  duration_hours: 10,
  banner_image: "",
  category_id: null,
  technologies: [],
  learning_outcomes: [],
  requirements: [],
  target_audience: [],
  rating: 0,
  student_count: 0,
  course_includes: [],
  instructor_id: null,
  faqs: [],
  what_you_will_learn: [],
  course_type: "regular",
  video_url: "",
};

describe("saveCourse", () => {
  beforeEach(() => {
    responseQueue = [];
    builders = [];
    rpcCalls = [];
    fromSpy.mockClear();
  });

  it("inserts a new course and returns its id when no existingId is given", async () => {
    responseQueue = [{ data: { id: "new-id" }, error: null }];
    const id = await saveCourse(draft);
    expect(id).toBe("new-id");
    expect(builders[0].__table).toBe("courses");
    expect(builders[0].__calls[0].method).toBe("insert");
    expect((builders[0].__calls[0].args[0] as any).title).toBe("SQL Bootcamp");
  });

  it("updates the existing course and returns the same id", async () => {
    responseQueue = [{ data: null, error: null }];
    const id = await saveCourse(draft, "course-1");
    expect(id).toBe("course-1");
    expect(builders[0].__calls[0].method).toBe("update");
    expect(builders[0].__calls[1]).toEqual({ method: "eq", args: ["id", "course-1"] });
  });

  it("throws when the insert fails", async () => {
    responseQueue = [{ data: null, error: { message: "constraint violation" } }];
    await expect(saveCourse(draft)).rejects.toMatchObject({ message: "constraint violation" });
  });

  it("converts start_date to an ISO string", async () => {
    responseQueue = [{ data: { id: "new-id" }, error: null }];
    await saveCourse({ ...draft, start_date: "2026-01-01" });
    const payload = builders[0].__calls[0].args[0] as any;
    expect(payload.start_date).toBe(new Date("2026-01-01").toISOString());
  });
});

describe("enrollStudent", () => {
  beforeEach(() => {
    responseQueue = [];
    builders = [];
    rpcCalls = [];
    fromSpy.mockClear();
  });

  it("inserts an enrollment row with payment_method from the form when the course is paid", async () => {
    responseQueue = [{ data: null, error: null }];
    await enrollStudent(
      "course-1",
      {
        name: "Ada",
        email: "ada@example.com",
        whatsapp: "+8801700000000",
        paymentMethod: "bkash",
        transactionId: "TXN1",
        extras: { profession: "Engineer", institute_name: "BUET" },
      },
      { isFree: false },
    );

    const payload = builders[0].__calls[0].args[0] as any;
    expect(payload.payment_method).toBe("bkash");
    expect(payload.transaction_id).toBe("TXN1");
  });

  it("forces payment_method to 'free' and clears transaction_id for free courses", async () => {
    responseQueue = [{ data: null, error: null }];
    await enrollStudent(
      "course-1",
      {
        name: "Ada",
        email: "ada@example.com",
        whatsapp: "+8801700000000",
        paymentMethod: "",
        transactionId: "",
        extras: {},
      },
      { isFree: true },
    );

    const payload = builders[0].__calls[0].args[0] as any;
    expect(payload.payment_method).toBe("free");
    expect(payload.transaction_id).toBeNull();
  });

  it("bumps promo code usage when a promo code was applied", async () => {
    responseQueue = [{ data: null, error: null }];
    await enrollStudent(
      "course-1",
      {
        name: "Ada",
        email: "ada@example.com",
        whatsapp: "+8801700000000",
        paymentMethod: "bkash",
        transactionId: "TXN1",
        extras: {},
        promoCode: "LAUNCH20",
        discountAmount: 200,
      },
      { isFree: false },
    );

    expect(rpcCalls).toEqual([{ fn: "increment_promo_code_usage", args: { code_input: "LAUNCH20" } }]);
  });

  it("does not call the promo RPC when no promo code was applied", async () => {
    responseQueue = [{ data: null, error: null }];
    await enrollStudent(
      "course-1",
      { name: "Ada", email: "ada@example.com", whatsapp: "+8801700000000", paymentMethod: "bkash", transactionId: "TXN1", extras: {} },
      { isFree: false },
    );

    expect(rpcCalls).toEqual([]);
  });

  it("throws when the insert fails", async () => {
    responseQueue = [{ data: null, error: { message: "duplicate enrollment" } }];
    await expect(
      enrollStudent(
        "course-1",
        { name: "Ada", email: "ada@example.com", whatsapp: "+8801700000000", paymentMethod: "bkash", transactionId: "TXN1", extras: {} },
        { isFree: false },
      ),
    ).rejects.toMatchObject({ message: "duplicate enrollment" });
  });
});
