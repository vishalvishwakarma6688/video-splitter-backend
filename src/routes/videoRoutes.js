import express from 'express';
import fs from 'fs';
import { validateVideoRequest } from '../functions/videoValidator.js';
import { getCachedVideo } from '../functions/cacheManager.js';
import { addVideoJob, getJobStatus, getQueueHealth } from '../functions/queueManager.js';
import { getClipPath } from '../functions/videoProcessor.js';
import { isRedisConnected } from '../functions/cacheManager.js';
import { estimateProcessingTime } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post(
    '/split-video',
    asyncHandler(async (req, res) => {
        const { url, duration } = req.body;

        logger.info(`Received split request: ${url}, duration: ${duration}s`);

        const validation = await validateVideoRequest(url, duration);

        if (!validation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: validation.error,
                code: validation.code
            });
        }

        const { videoId, info } = validation;

        const cached = await getCachedVideo(videoId, duration);

        if (cached) {
            logger.info(`Returning cached result for ${videoId}`);
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                cached: true,
                clips: cached.clips,
                message: 'Video already processed (from cache)'
            });
        }
        const jobResult = await addVideoJob(url, duration, videoId, info);

        const estimatedTime = estimateProcessingTime(info.duration, duration);

        res.status(HTTP_STATUS.ACCEPTED).json({
            success: true,
            jobId: jobResult.jobId,
            message: 'Video processing started',
            estimatedTime
        });
    })
);

router.get(
    '/job-status/:jobId',
    asyncHandler(async (req, res) => {
        const { jobId } = req.params;

        const status = await getJobStatus(jobId);

        if (!status.found) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'Job not found',
                code: ERROR_CODES.NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            jobId,
            status: status.status,
            progress: status.progress,
            clips: status.result?.clips || [],
            failedReason: status.failedReason,
            createdAt: status.createdAt,
            finishedAt: status.finishedAt
        });
    })
);

router.get('/clips/:videoId/:filename', (req, res) => {
    const { videoId, filename } = req.params;

    const clipPath = getClipPath(videoId, filename);

    if (!fs.existsSync(clipPath)) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: 'Clip not found',
            code: ERROR_CODES.NOT_FOUND
        });
    }

    // Get file stats
    const stat = fs.statSync(clipPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        // Handle range requests for video streaming
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(clipPath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });

        file.pipe(res);
    } else {
        // Send entire file
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        });

        fs.createReadStream(clipPath).pipe(res);
    }
});

router.get(
    '/health',
    asyncHandler(async (req, res) => {
        const redisConnected = await isRedisConnected();
        const queueHealth = await getQueueHealth();

        const healthy = redisConnected && queueHealth.healthy;

        res.status(healthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
            success: healthy,
            status: healthy ? 'healthy' : 'unhealthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: {
                redis: redisConnected ? 'connected' : 'disconnected',
                queue: queueHealth.healthy ? 'healthy' : 'unhealthy',
                queueCounts: queueHealth.counts
            }
        });
    })
);

export default router;
