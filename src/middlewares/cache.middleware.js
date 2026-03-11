import redis from '../config/redis.js'

export const cacheMiddleware = (ttlSeconds) => async (req, res, next) => {
  try {
    // build unique cache key from URL + query params
    const key = `cache:${req.originalUrl}`

    // check if data exists in Redis
    const cached = await redis.get(key)
    if (cached) {
      console.log(`Cache HIT: ${key}`)
      return res.status(200).json(JSON.parse(cached))
    }

    console.log(`Cache MISS: ${key}`)

    // intercept res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = async (body) => {
      // store in Redis with TTL
      await redis.setex(key, ttlSeconds, JSON.stringify(body))
      return originalJson(body)
    }

    next()
  } catch (err) {
    // if Redis fails — just skip cache and continue normally
    console.error('Cache error:', err.message)
    next()
  }
}