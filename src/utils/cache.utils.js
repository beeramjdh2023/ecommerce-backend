import redis from '../config/redis.js'

// delete single cache key
export const invalidateCache = async (key) => {
  await redis.del(key)
}

// delete all keys matching a pattern
export const invalidateCachePattern = async (pattern) => {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}