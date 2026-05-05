import { describe, it, expect } from 'vitest';
import { isOverdue } from '../types';

describe('isOverdue — domain funksiyasi', () => {
  it("tugash sanasi o'tgan va todo bo'lsa overdue", () => {
    expect(isOverdue({ dueDate: '2020-01-01', status: 'todo' })).toBe(true);
  });

  it("tugash sanasi o'tgan va in_progress bo'lsa overdue", () => {
    expect(isOverdue({ dueDate: '2020-01-01', status: 'in_progress' })).toBe(true);
  });

  it("done status bo'lsa overdue emas (tugagan vazifalar o'tgan sanaga e'tibor bermaydi)", () => {
    expect(isOverdue({ dueDate: '2020-01-01', status: 'done' })).toBe(false);
  });

  it("kelajakdagi sana — overdue emas", () => {
    expect(isOverdue({ dueDate: '2099-12-31', status: 'todo' })).toBe(false);
  });

  it("dueDate null bo'lsa overdue emas", () => {
    expect(isOverdue({ dueDate: null, status: 'todo' })).toBe(false);
  });
});
