import type Stripe from 'stripe';

export type PlanStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

export interface SubscriptionMetadata {
  planKey: string | null;
  planStatus: PlanStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

const DEFAULT_SUBSCRIPTION_METADATA: SubscriptionMetadata = {
  planKey: null,
  planStatus: 'inactive',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null
};

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function normalizeSubscriptionMetadata(value: unknown): SubscriptionMetadata {
  const input = asObject(value);
  const status = asString(input.planStatus);

  return {
    planKey: asString(input.planKey),
    planStatus:
      status === 'active' || status === 'past_due' || status === 'canceled'
        ? status
        : 'inactive',
    stripeCustomerId: asString(input.stripeCustomerId),
    stripeSubscriptionId: asString(input.stripeSubscriptionId),
    currentPeriodEnd: asString(input.currentPeriodEnd)
  };
}

export function mapStripeStatusToPlanStatus(status: Stripe.Subscription.Status): PlanStatus {
  if (status === 'active' || status === 'trialing') {
    return 'active';
  }

  if (status === 'past_due' || status === 'unpaid') {
    return 'past_due';
  }

  if (status === 'canceled' || status === 'incomplete_expired') {
    return 'canceled';
  }

  return 'inactive';
}

export function withSubscriptionDefaults(value: unknown): SubscriptionMetadata {
  return {
    ...DEFAULT_SUBSCRIPTION_METADATA,
    ...normalizeSubscriptionMetadata(value)
  };
}
