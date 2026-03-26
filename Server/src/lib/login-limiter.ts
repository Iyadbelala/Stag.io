/**
 * In-memory account lockout tracker.
 * Locks an account for 15 minutes after 5 consecutive failed login attempts.
 * Resets on successful login.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

/** Record a failed login attempt. Returns true if account is now locked. */
export function recordFailedAttempt(email: string): boolean {
  const key = email.toLowerCase();
  const record = attempts.get(key) ?? { count: 0, lockedUntil: null };

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    attempts.set(key, record);
    return true;
  }

  attempts.set(key, record);
  return false;
}

/** Check if an account is currently locked. Returns remaining seconds or 0. */
export function isAccountLocked(email: string): number {
  const key = email.toLowerCase();
  const record = attempts.get(key);

  if (!record?.lockedUntil) return 0;

  const remaining = record.lockedUntil - Date.now();
  if (remaining <= 0) {
    // Lockout expired — reset
    attempts.delete(key);
    return 0;
  }

  return Math.ceil(remaining / 1000);
}

/** Clear failed attempts on successful login. */
export function clearFailedAttempts(email: string): void {
  attempts.delete(email.toLowerCase());
}

/** Periodic cleanup of expired lockouts */
function cleanup() {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (record.lockedUntil && record.lockedUntil < now) {
      attempts.delete(key);
    }
  }
}

setInterval(cleanup, 5 * 60 * 1000).unref();
