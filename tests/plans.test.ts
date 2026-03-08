import { describe, expect, it } from 'vitest';
import { isPlanKey } from '../src/lib/plans';

describe('plan key checks', () => {
  it('accepts supported plans', () => {
    expect(isPlanKey('yearly_1')).toBe(true);
    expect(isPlanKey('yearly_10')).toBe(true);
  });

  it('rejects unsupported plans', () => {
    expect(isPlanKey('monthly_1')).toBe(false);
    expect(isPlanKey('')).toBe(false);
    expect(isPlanKey(null)).toBe(false);
  });
});
