// middleware/rateLimiter.js
// Simple in-memory rate limiter (per user) — good enough to start.
// For production with multiple server instances, swap this for a Redis-based limiter.

const usageMap = new Map(); // userId -> { count, resetAt }

const FREE_LIMIT_PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function rateLimiter(req, res, next) {
  const userId = req.user.id;
  const now = Date.now();

  let entry = usageMap.get(userId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
  }

  if (entry.count >= FREE_LIMIT_PER_DAY) {
    return res.status(429).json({
      error: `Daily query limit reached (${FREE_LIMIT_PER_DAY}/day on free plan). Try again tomorrow.`,
    });
  }

  entry.count += 1;
  usageMap.set(userId, entry);
  next();
}

module.exports = rateLimiter;
