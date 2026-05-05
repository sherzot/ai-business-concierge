import { describe, it, expect } from 'vitest';
import { healthScoreColor } from '../types';

describe('healthScoreColor — domain funksiyasi', () => {
  it("75+ ball — yashil (emerald)", () => {
    expect(healthScoreColor(75)).toBe('emerald');
    expect(healthScoreColor(100)).toBe('emerald');
  });

  it("50-74 ball — sariq (amber)", () => {
    expect(healthScoreColor(50)).toBe('amber');
    expect(healthScoreColor(74)).toBe('amber');
  });

  it("50 dan past — qizil (rose)", () => {
    expect(healthScoreColor(49)).toBe('rose');
    expect(healthScoreColor(0)).toBe('rose');
  });
});
