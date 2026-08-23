const rateLimit = require('express-rate-limit');

function createRateLimiter() {
  // Defaults are conservative; override via env if needed.
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 300);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please slow down.' },
  });
}

// Much stricter limiter for credential endpoints (login/register) so an
// attacker cannot brute-force passwords within the generous global limit.
function createAuthRateLimiter() {
  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60_000);
  const max = Number(process.env.AUTH_RATE_LIMIT_MAX || 20);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, errorMessage: 'Too many attempts. Please try again later.' },
  });
}

module.exports = createRateLimiter;
module.exports.createAuthRateLimiter = createAuthRateLimiter;

