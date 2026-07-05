-- ADR-0001: promo codes and sale pricing are mutually exclusive per course.
-- promo_only = false (Sale Pricing, default): discounted_price is charged; promo field hidden.
-- promo_only = true (Promo-Only Pricing): full price listed; promo codes are the only discount.
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS promo_only boolean NOT NULL DEFAULT false;

NOTIFY pgrst, 'reload schema';
