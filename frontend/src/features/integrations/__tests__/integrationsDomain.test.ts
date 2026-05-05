import { describe, it, expect } from 'vitest';
import { isConnected } from '../types';

describe('isConnected — domain funksiyasi', () => {
  it("connected status — true", () => {
    expect(isConnected({ status: 'connected' })).toBe(true);
  });

  it("disconnected — false", () => {
    expect(isConnected({ status: 'disconnected' })).toBe(false);
  });

  it("pending — false (hali ulangani yo'q)", () => {
    expect(isConnected({ status: 'pending' })).toBe(false);
  });
});
