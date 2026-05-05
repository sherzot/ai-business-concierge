import { describe, it, expect } from 'vitest';
import { countUnread } from '../types';

describe('countUnread — domain funksiyasi', () => {
  it("barcha o'qilgan bo'lsa 0 qaytaradi", () => {
    expect(countUnread([{ isRead: true }, { isRead: true }])).toBe(0);
  });

  it("o'qilmaganlar sonini to'g'ri hisoblaydi", () => {
    expect(countUnread([{ isRead: false }, { isRead: true }, { isRead: false }])).toBe(2);
  });

  it("bo'sh array bo'lsa 0 qaytaradi", () => {
    expect(countUnread([])).toBe(0);
  });
});
