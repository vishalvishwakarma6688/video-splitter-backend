import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 86400;

function generateCacheKey(videoId, duration) {
    return `video:${videoId}:${duration}`;
}

export async function getCachedVideo(videoId, duration) {
    try {
        const key = generateCacheKey(videoId, duration);
        const cached = await redisClient.get(key);

        if (cached) {
            logger.info(`Cache hit for ${key}`);
            return JSON.parse(cached);
        }

        logger.info(`Cache miss for ${key}`);
        return null;
    } catch (error) {
        logger.error('Cache get error:', error);
        return null;
    }
}

export async function setCachedVideo(videoId, duration, data) {
    try {
        const key = generateCacheKey(videoId, duration);
        await redisClient.setex(key, CACHE_TTL, JSON.stringify(data));
        logger.info(`Cached data for ${key}`);
        return true;
    } catch (error) {
        logger.error('Cache set error:', error);
        return false;
    }
}

export async function invalidateCache(videoId) {
    try {
        const pattern = `video:${videoId}:*`;
        const keys = await redisClient.keys(pattern);

        if (keys.length > 0) {
            await redisClient.del(...keys);
            logger.info(`Invalidated cache for ${videoId}`);
        }

        return true;
    } catch (error) {
        logger.error('Cache invalidation error:', error);
        return false;
    }
}

export async function isRedisConnected() {
    try {
        await redisClient.ping();
        return true;
    } catch (error) {
        return false;
    }
}
