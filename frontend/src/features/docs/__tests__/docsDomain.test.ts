import { describe, it, expect } from 'vitest';
import { isPendingReview } from '../types';

describe('isPendingReview — domain funksiyasi', () => {
  it("review statusdagi hujjat pending", () => {
    expect(isPendingReview({ status: 'review' })).toBe(true);
  });

  it("approved statusdagi hujjat pending emas", () => {
    expect(isPendingReview({ status: 'approved' })).toBe(false);
  });

  it("draft hujjat pending emas", () => {
    expect(isPendingReview({ status: 'draft' })).toBe(false);
  });

  it("status yo'q bo'lsa pending emas", () => {
    expect(isPendingReview({ status: undefined })).toBe(false);
  });
});
