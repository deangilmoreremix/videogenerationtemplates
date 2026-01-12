import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = createClient({
  url: redisUrl,
})

redis.on('error', (err) => console.error('Redis Client Error', err))

// Connect to Redis
redis.connect().catch(console.error)

// Helper functions
export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key)
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export const setCache = async (key: string, value: string, ttl?: number): Promise<void> => {
  try {
    if (ttl) {
      await redis.setEx(key, ttl, value)
    } else {
      await redis.set(key, value)
    }
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}