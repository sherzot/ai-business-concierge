import { describe, it, expect } from 'vitest';
import { isUrgentCase } from '../types';

describe('isUrgentCase — domain funksiyasi', () => {
  it("high priority + open bo'lsa urgent", () => {
    expect(isUrgentCase({ status: 'open', priority: 'high' })).toBe(true);
  });

  it("high priority + in_review bo'lsa urgent", () => {
    expect(isUrgentCase({ status: 'in_review', priority: 'high' })).toBe(true);
  });

  it("resolved bo'lsa urgent emas (hal qilingan)", () => {
    expect(isUrgentCase({ status: 'resolved', priority: 'high' })).toBe(false);
  });

  it("medium priority bo'lsa urgent emas", () => {
    expect(isUrgentCase({ status: 'open', priority: 'medium' })).toBe(false);
  });
});
