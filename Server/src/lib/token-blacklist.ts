/**
 * In-memory token blacklist for revoking JWTs on logout.
 * Tokens are stored until their natural expiry (15 min for access tokens).
 * For multi-server deployments, replace with Redis.
 */

const blacklist = new Map<string, number>(); // token -> expiry timestamp

/** Add a token to the blacklist until it expires */
export function blacklistToken(token: string, expiresAt: number): void {
  blacklist.set(token, expiresAt);
}

/** Check if a token has been revoked */
export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}

/** Periodically clean up expired tokens to prevent memory leaks */
function cleanup() {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of blacklist) {
    if (exp < now) {
      blacklist.delete(token);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000).unref();
