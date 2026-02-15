import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
};

const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
});

redisClient.on('close', () => {
    logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
});

export default redisClient;
