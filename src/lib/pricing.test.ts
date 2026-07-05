import { describe, it, expect } from "vitest";
import { resolveCoursePricing } from "./pricing";

// ADR-0001: promo codes and sale pricing are mutually exclusive per course.

describe("resolveCoursePricing — Sale Pricing (default mode)", () => {
  it("shows the discounted price with the full price struck through, and does not allow promo entry", () => {
    const pricing = resolveCoursePricing({
      price: 8500,
      discounted_price: 5865,
      is_free: false,
      promo_only: false,
    });

    expect(pricing.listPrice).toBe(5865);
    expect(pricing.strikethroughPrice).toBe(8500);
    expect(pricing.promoAllowed).toBe(false);
    expect(pricing.finalAmount).toBe(5865);
  });

  it("ignores a promo code entirely — discounts never stack (ADR-0001)", () => {
    const pricing = resolveCoursePricing(
      { price: 8500, discounted_price: 5865, is_free: false, promo_only: false },
      { discount_type: "percentage", discount_value: 50 },
    );

    expect(pricing.discountAmount).toBe(0);
    expect(pricing.finalAmount).toBe(5865);
  });
});

describe("resolveCoursePricing — Promo-Only Pricing", () => {
  it("lists at the full price with no strikethrough, and allows promo entry, ignoring any admin sale price", () => {
    const pricing = resolveCoursePricing({
      price: 8500,
      discounted_price: 5865,
      is_free: false,
      promo_only: true,
    });

    expect(pricing.listPrice).toBe(8500);
    expect(pricing.strikethroughPrice).toBeNull();
    expect(pricing.promoAllowed).toBe(true);
    expect(pricing.finalAmount).toBe(8500);
  });

  it("applies a percentage promo code to the full price", () => {
    const pricing = resolveCoursePricing(
      { price: 1000, is_free: false, promo_only: true },
      { discount_type: "percentage", discount_value: 20 },
    );

    expect(pricing.discountAmount).toBe(200);
    expect(pricing.finalAmount).toBe(800);
  });

  it("never charges below zero when a fixed code exceeds the price", () => {
    const pricing = resolveCoursePricing(
      { price: 1000, is_free: false, promo_only: true },
      { discount_type: "fixed", discount_value: 1500 },
    );

    expect(pricing.finalAmount).toBe(0);
    expect(pricing.discountAmount).toBe(1000);
  });
});

describe("resolveCoursePricing — free courses", () => {
  it("costs nothing and never offers promo entry, regardless of stored prices or mode", () => {
    const pricing = resolveCoursePricing(
      { price: 8500, discounted_price: 5865, is_free: true, promo_only: true },
      { discount_type: "percentage", discount_value: 20 },
    );

    expect(pricing.listPrice).toBe(0);
    expect(pricing.strikethroughPrice).toBeNull();
    expect(pricing.promoAllowed).toBe(false);
    expect(pricing.discountAmount).toBe(0);
    expect(pricing.finalAmount).toBe(0);
  });
});
