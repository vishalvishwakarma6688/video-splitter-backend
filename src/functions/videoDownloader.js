import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { ensureDirectory } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function downloadVideo(url, videoId) {
    try {
        await ensureDirectory(UPLOAD_DIR);

        const outputPath = path.join(UPLOAD_DIR, `${videoId}.mp4`);

        if (fs.existsSync(outputPath)) {
            logger.info(`Video ${videoId} already downloaded`);
            return { success: true, path: outputPath };
        }

        logger.info(`Starting download for video ${videoId}`);

        return new Promise((resolve, reject) => {
            const videoStream = ytdl(url, {
                quality: 'highest',
                filter: 'audioandvideo'
            });

            const writeStream = fs.createWriteStream(outputPath);

            videoStream.pipe(writeStream);

            let downloadedBytes = 0;

            videoStream.on('progress', (chunkLength, downloaded, total) => {
                downloadedBytes = downloaded;
                const percent = ((downloaded / total) * 100).toFixed(2);
                logger.debug(`Download progress: ${percent}%`);
            });

            writeStream.on('finish', () => {
                logger.info(`Video ${videoId} downloaded successfully`);
                resolve({ success: true, path: outputPath });
            });

            videoStream.on('error', (error) => {
                logger.error(`Download error for ${videoId}:`, error);
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                reject(new Error('Failed to download video'));
            });

            writeStream.on('error', (error) => {
                logger.error(`Write error for ${videoId}:`, error);
                reject(new Error('Failed to write video file'));
            });
        });
    } catch (error) {
        logger.error('Download function error:', error);
        throw new Error('Failed to download video');
    }
}

export async function cleanupVideo(videoId) {
    try {
        const videoPath = path.join(UPLOAD_DIR, `${videoId}.mp4`);

        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
            logger.info(`Cleaned up video ${videoId}`);
        }
    } catch (error) {
        logger.error('Cleanup error:', error);
    }
}
