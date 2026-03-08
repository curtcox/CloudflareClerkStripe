export const PLAN_CATALOG = {
  yearly_1: {
    key: 'yearly_1',
    name: '$1 / year',
    amountUsd: 1,
    interval: 'year',
    envPriceKey: 'STRIPE_PRICE_ID_YEARLY_1'
  },
  yearly_10: {
    key: 'yearly_10',
    name: '$10 / year',
    amountUsd: 10,
    interval: 'year',
    envPriceKey: 'STRIPE_PRICE_ID_YEARLY_10'
  }
} as const;

export type PlanKey = keyof typeof PLAN_CATALOG;

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === 'string' && value in PLAN_CATALOG;
}

export function getPlanPriceId(planKey: PlanKey): string {
  const price =
    planKey === 'yearly_1'
      ? import.meta.env.STRIPE_PRICE_ID_YEARLY_1
      : import.meta.env.STRIPE_PRICE_ID_YEARLY_10;

  if (!price) {
    throw new Error(`Missing Stripe price ID for plan: ${planKey}`);
  }

  return price;
}
