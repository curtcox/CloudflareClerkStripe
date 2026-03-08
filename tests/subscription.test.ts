import { describe, expect, it } from 'vitest';
import {
  mapStripeStatusToPlanStatus,
  normalizeSubscriptionMetadata,
  withSubscriptionDefaults
} from '../src/lib/subscription';

describe('subscription metadata', () => {
  it('normalizes unknown input with safe defaults', () => {
    const result = withSubscriptionDefaults(undefined);

    expect(result.planKey).toBeNull();
    expect(result.planStatus).toBe('inactive');
    expect(result.stripeCustomerId).toBeNull();
    expect(result.stripeSubscriptionId).toBeNull();
    expect(result.currentPeriodEnd).toBeNull();
  });

  it('keeps valid metadata values', () => {
    const result = normalizeSubscriptionMetadata({
      planKey: 'yearly_10',
      planStatus: 'active',
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      currentPeriodEnd: '2026-01-01T00:00:00.000Z'
    });

    expect(result.planKey).toBe('yearly_10');
    expect(result.planStatus).toBe('active');
    expect(result.stripeCustomerId).toBe('cus_123');
    expect(result.stripeSubscriptionId).toBe('sub_123');
    expect(result.currentPeriodEnd).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('stripe status mapping', () => {
  it('maps active and trialing to active', () => {
    expect(mapStripeStatusToPlanStatus('active')).toBe('active');
    expect(mapStripeStatusToPlanStatus('trialing')).toBe('active');
  });

  it('maps delinquent statuses', () => {
    expect(mapStripeStatusToPlanStatus('past_due')).toBe('past_due');
    expect(mapStripeStatusToPlanStatus('unpaid')).toBe('past_due');
  });

  it('maps canceled lifecycle statuses', () => {
    expect(mapStripeStatusToPlanStatus('canceled')).toBe('canceled');
    expect(mapStripeStatusToPlanStatus('incomplete_expired')).toBe('canceled');
  });
});
