// Pricing resolver — the single decision point for course pricing.
// ADR-0001: promo codes and sale pricing are mutually exclusive per course.

export interface CoursePricingFields {
  price?: number | null;
  discounted_price?: number | null;
  is_free?: boolean;
  promo_only?: boolean | null;
}

export interface AppliedPromo {
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

export interface ResolvedPricing {
  /** Price displayed prominently and charged before any promo. */
  listPrice: number;
  /** Original price shown struck through, or null when nothing is crossed out. */
  strikethroughPrice: number | null;
  /** Whether the promo-code field may be offered for this course. */
  promoAllowed: boolean;
  /** Amount deducted by the applied promo (0 when none applies). */
  discountAmount: number;
  /** The amount actually charged. Never negative. */
  finalAmount: number;
}

export function resolveCoursePricing(
  course: CoursePricingFields,
  appliedPromo?: AppliedPromo | null,
): ResolvedPricing {
  const price = course.price ?? 0;

  if (course.is_free) {
    return {
      listPrice: 0,
      strikethroughPrice: null,
      promoAllowed: false,
      discountAmount: 0,
      finalAmount: 0,
    };
  }

  if (course.promo_only) {
    const rawDiscount = appliedPromo
      ? appliedPromo.discount_type === "percentage"
        ? (price * appliedPromo.discount_value) / 100
        : appliedPromo.discount_value
      : 0;
    const discountAmount = Math.min(rawDiscount, price);
    return {
      listPrice: price,
      strikethroughPrice: null,
      promoAllowed: true,
      discountAmount,
      finalAmount: price - discountAmount,
    };
  }

  const listPrice = course.discounted_price ?? price;
  return {
    listPrice,
    strikethroughPrice: course.discounted_price != null ? price : null,
    promoAllowed: false,
    discountAmount: 0,
    finalAmount: listPrice,
  };
}
