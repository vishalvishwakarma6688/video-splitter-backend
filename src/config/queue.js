import Queue from 'bull';
import logger from '../utils/logger.js';

const queueName = process.env.QUEUE_NAME || 'video-processing';
const concurrency = parseInt(process.env.QUEUE_CONCURRENCY) || 5;

const queueConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
    }
};

const videoQueue = new Queue(queueName, queueConfig);

videoQueue.on('error', (error) => {
    logger.error('Queue error:', error);
});

videoQueue.on('waiting', (jobId) => {
    logger.info(`Job ${jobId} is waiting`);
});

videoQueue.on('active', (job) => {
    logger.info(`Job ${job.id} started processing`);
});

videoQueue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed successfully`);
});

videoQueue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed:`, err.message);
});

videoQueue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled`);
});

export { videoQueue, concurrency };
