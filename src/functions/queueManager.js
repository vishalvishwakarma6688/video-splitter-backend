import { v4 as uuidv4 } from 'uuid';
import { videoQueue } from '../config/queue.js';
import { JOB_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export async function addVideoJob(url, duration, videoId, videoInfo) {
    try {
        const jobId = uuidv4();

        const job = await videoQueue.add(
            {
                jobId,
                url,
                duration,
                videoId,
                videoInfo,
                createdAt: new Date().toISOString()
            },
            {
                jobId,
                priority: 1
            }
        );

        logger.info(`Job ${jobId} added to queue`);

        return {
            success: true,
            jobId,
            job
        };
    } catch (error) {
        logger.error('Add job error:', error);
        throw new Error('Failed to add job to queue');
    }
}

export async function getJobStatus(jobId) {
    try {
        const job = await videoQueue.getJob(jobId);

        if (!job) {
            return {
                found: false,
                status: null
            };
        }

        const state = await job.getState();
        const progress = job.progress();
        const returnValue = job.returnvalue;

        let status = JOB_STATUS.PENDING;

        if (state === 'completed') {
            status = JOB_STATUS.COMPLETED;
        } else if (state === 'failed') {
            status = JOB_STATUS.FAILED;
        } else if (state === 'active') {
            status = JOB_STATUS.PROCESSING;
        }

        return {
            found: true,
            jobId,
            status,
            progress: progress || 0,
            data: job.data,
            result: returnValue,
            failedReason: job.failedReason,
            createdAt: job.timestamp,
            processedAt: job.processedOn,
            finishedAt: job.finishedOn
        };
    } catch (error) {
        logger.error('Get job status error:', error);
        throw new Error('Failed to get job status');
    }
}

export async function updateJobProgress(job, progress) {
    try {
        await job.progress(progress);
        logger.debug(`Job ${job.id} progress: ${progress}%`);
    } catch (error) {
        logger.error('Update progress error:', error);
    }
}

export async function getQueueHealth() {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            videoQueue.getWaitingCount(),
            videoQueue.getActiveCount(),
            videoQueue.getCompletedCount(),
            videoQueue.getFailedCount(),
            videoQueue.getDelayedCount()
        ]);

        return {
            healthy: true,
            counts: {
                waiting,
                active,
                completed,
                failed,
                delayed
            }
        };
    } catch (error) {
        logger.error('Queue health check error:', error);
        return {
            healthy: false,
            error: error.message
        };
    }
}
