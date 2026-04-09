import { describe, it, expect } from 'vitest';
import { blacklistToken, isTokenBlacklisted } from './token-blacklist';

/* ════════════════════════════════════════════════
   Token Blacklist — Unit Tests
   ════════════════════════════════════════════════ */

describe('Token Blacklist', () => {
  it('a fresh token is not blacklisted', () => {
    expect(isTokenBlacklisted('some-random-token-abc123')).toBe(false);
  });

  it('a blacklisted token is detected', () => {
    const token = 'test-token-' + Date.now();
    const futureExpiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    blacklistToken(token, futureExpiry);
    expect(isTokenBlacklisted(token)).toBe(true);
  });

  it('different tokens are independent', () => {
    const token1 = 'token-one-' + Date.now();
    const token2 = 'token-two-' + Date.now();
    const futureExpiry = Math.floor(Date.now() / 1000) + 3600;

    blacklistToken(token1, futureExpiry);

    expect(isTokenBlacklisted(token1)).toBe(true);
    expect(isTokenBlacklisted(token2)).toBe(false);
  });
});
