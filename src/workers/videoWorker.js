import { videoQueue, concurrency } from '../config/queue.js';
import { downloadVideo, cleanupVideo } from '../functions/videoDownloader.js';
import { splitVideo } from '../functions/videoProcessor.js';
import { setCachedVideo } from '../functions/cacheManager.js';
import { updateJobProgress } from '../functions/queueManager.js';
import { ERROR_CODES } from '../utils/constants.js';
import logger from '../utils/logger.js';

async function processVideoJob(job) {
    const { jobId, url, duration, videoId, videoInfo } = job.data;

    try {
        logger.info(`Processing job ${jobId} for video ${videoId}`);

        await updateJobProgress(job, 10);
        logger.info(`Downloading video ${videoId}...`);

        const downloadResult = await downloadVideo(url, videoId);

        if (!downloadResult.success) {
            throw new Error('Video download failed');
        }

        await updateJobProgress(job, 40);

        // Step 2: Split video (40-90%)
        logger.info(`Splitting video ${videoId}...`);

        const splitResult = await splitVideo(
            downloadResult.path,
            videoId,
            duration,
            videoInfo.duration
        );

        if (!splitResult.success) {
            throw new Error('Video splitting failed');
        }

        await updateJobProgress(job, 90);

        logger.info(`Caching results for ${videoId}...`);

        const cacheData = {
            videoId,
            duration,
            clips: splitResult.clips,
            videoInfo,
            processedAt: new Date().toISOString()
        };

        await setCachedVideo(videoId, duration, cacheData);

        await updateJobProgress(job, 95);

        // Step 4: Cleanup downloaded video (95-100%)
        logger.info(`Cleaning up downloaded video ${videoId}...`);
        await cleanupVideo(videoId);

        await updateJobProgress(job, 100);

        logger.info(`Job ${jobId} completed successfully`);

        return {
            success: true,
            jobId,
            videoId,
            clips: splitResult.clips,
            message: 'Video processed successfully'
        };
    } catch (error) {
        logger.error(`Job ${jobId} failed:`, error);

        // Cleanup on failure
        try {
            await cleanupVideo(videoId);
        } catch (cleanupError) {
            logger.error('Cleanup error:', cleanupError);
        }

        throw new Error(error.message || 'Video processing failed');
    }
}

export function startVideoWorker() {
    logger.info(`Starting video worker with concurrency: ${concurrency}`);

    videoQueue.process(concurrency, async (job) => {
        return await processVideoJob(job);
    });

    logger.info('Video worker started successfully');
}

export async function stopVideoWorker() {
    logger.info('Stopping video worker...');

    await videoQueue.close();

    logger.info('Video worker stopped');
}
