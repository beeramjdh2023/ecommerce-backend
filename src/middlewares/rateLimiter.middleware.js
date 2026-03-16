import redis from '../config/redis.js'

export const rateLimiter = (maxRequests, windowSeconds, identifier = 'global') => {
  return async (req, res, next) => {
    try {
      // build key — rate limit per IP per route type
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
      const key = `ratelimit:${identifier}:${ip}`

      // increment counter
      const current = await redis.incr(key)

      // set expiry on first request only
      if (current === 1) {
        await redis.expire(key, windowSeconds)
      }

      // get TTL for response headers
      const ttl = await redis.ttl(key)

      // set rate limit headers using Express res.set()
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
        'X-RateLimit-Reset': ttl
      })

      if (current > maxRequests) {
        return res.status(429).json({
          message: 'Too many requests. Please try again later',
          retry_after: ttl
        })
      }

      next()
    } catch (err) {
      // if Redis fails — skip rate limiting and continue
      console.error('Rate limiter error:', err.message)
      next()
    }
  }
}