// In-memory sliding window rate-limiter
const ipRequestCounts = new Map();

// Periodic cleanup of expired rate limit buckets (unref'd to prevent keeping test event loops alive)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of ipRequestCounts.entries()) {
    if (now > entry.resetTime) {
      ipRequestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

export const rateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes default
  max = 100, // max requests per window
  message = 'Too many requests, please try again later.',
} = {}) => {
  return (req, res, next) => {
    // In test environment, bypass rate limits to allow fast suite runs
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipRequestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    } else {
      entry.count += 1;
    }

    ipRequestCounts.set(ip, entry);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    next();
  };
};
