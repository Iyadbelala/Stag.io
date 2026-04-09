import { describe, it, expect, beforeEach } from 'vitest';
import { recordFailedAttempt, isAccountLocked, clearFailedAttempts } from './login-limiter';

/* ════════════════════════════════════════════════
   Login Limiter — Unit Tests
   ════════════════════════════════════════════════ */

describe('Login Limiter', () => {
  const TEST_EMAIL = 'test-limiter@example.com';

  beforeEach(() => {
    // Clear state before each test so tests are independent
    clearFailedAttempts(TEST_EMAIL);
  });

  it('does not lock after a single failed attempt', () => {
    const locked = recordFailedAttempt(TEST_EMAIL);
    expect(locked).toBe(false);
    expect(isAccountLocked(TEST_EMAIL)).toBe(0);
  });

  it('does not lock after 4 failed attempts', () => {
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(TEST_EMAIL);
    }
    expect(isAccountLocked(TEST_EMAIL)).toBe(0);
  });

  it('locks after 5 failed attempts', () => {
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(TEST_EMAIL);
    }
    const locked = recordFailedAttempt(TEST_EMAIL); // 5th attempt
    expect(locked).toBe(true);
    expect(isAccountLocked(TEST_EMAIL)).toBeGreaterThan(0);
  });

  it('returns remaining seconds when locked', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(TEST_EMAIL);
    }
    const remaining = isAccountLocked(TEST_EMAIL);
    // Should be close to 15 minutes (900 seconds), give or take a second
    expect(remaining).toBeGreaterThan(890);
    expect(remaining).toBeLessThanOrEqual(900);
  });

  it('clears attempts on successful login', () => {
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(TEST_EMAIL);
    }
    clearFailedAttempts(TEST_EMAIL);

    // After clearing, next failed attempt should be attempt #1 again
    const locked = recordFailedAttempt(TEST_EMAIL);
    expect(locked).toBe(false);
    expect(isAccountLocked(TEST_EMAIL)).toBe(0);
  });

  it('is case-insensitive for emails', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('User@Example.COM');
    }
    // Should find the lock even with different casing
    expect(isAccountLocked('user@example.com')).toBeGreaterThan(0);

    // Cleanup with different casing should still work
    clearFailedAttempts('USER@EXAMPLE.COM');
    expect(isAccountLocked('user@example.com')).toBe(0);
  });
});
