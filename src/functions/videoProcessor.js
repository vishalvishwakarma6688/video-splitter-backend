import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { ensureDirectory, generateFilename } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
const FFMPEG_THREADS = parseInt(process.env.FFMPEG_THREADS) || 4;

if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    logger.info(`Using custom FFmpeg path: ${process.env.FFMPEG_PATH}`);
}

if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    logger.info(`Using custom FFprobe path: ${process.env.FFPROBE_PATH}`);
}

export async function splitVideo(videoPath, videoId, duration, videoDuration) {
    try {
        const jobOutputDir = path.join(OUTPUT_DIR, videoId);
        await ensureDirectory(jobOutputDir);

        const numberOfClips = Math.ceil(videoDuration / duration);
        const clips = [];

        logger.info(`Splitting video ${videoId} into ${numberOfClips} clips`);

        for (let i = 0; i < numberOfClips; i++) {
            const startTime = i * duration;
            const clipDuration = Math.min(duration, videoDuration - startTime);
            const clipFilename = generateFilename(videoId, i + 1);
            const clipPath = path.join(jobOutputDir, clipFilename);

            await processClip(videoPath, clipPath, startTime, clipDuration);

            clips.push({
                url: `/api/clips/${videoId}/${clipFilename}`,
                index: i + 1,
                duration: clipDuration,
                path: clipPath
            });

            logger.info(`Clip ${i + 1}/${numberOfClips} processed`);
        }

        logger.info(`Video ${videoId} split successfully into ${clips.length} clips`);

        return { success: true, clips };
    } catch (error) {
        logger.error('Video splitting error:', error);
        throw new Error('Failed to split video');
    }
}

function processClip(inputPath, outputPath, startTime, duration) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .output(outputPath)
            .outputOptions([
                '-c:v libx264',      // Video codec
                '-preset fast',       // Encoding speed
                '-crf 23',           // Quality (lower = better)
                '-c:a aac',          // Audio codec
                '-b:a 128k',         // Audio bitrate
                `-threads ${FFMPEG_THREADS}`
            ])
            .on('start', (commandLine) => {
                logger.debug(`FFmpeg command: ${commandLine}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    logger.debug(`Processing: ${progress.percent.toFixed(2)}%`);
                }
            })
            .on('end', () => {
                logger.debug(`Clip saved to ${outputPath}`);
                resolve();
            })
            .on('error', (err) => {
                logger.error(`FFmpeg error: ${err.message}`);
                reject(err);
            })
            .run();
    });
}

export async function cleanupClips(videoId) {
    try {
        const jobOutputDir = path.join(OUTPUT_DIR, videoId);

        if (fs.existsSync(jobOutputDir)) {
            fs.rmSync(jobOutputDir, { recursive: true, force: true });
            logger.info(`Cleaned up clips for ${videoId}`);
        }
    } catch (error) {
        logger.error('Cleanup clips error:', error);
    }
}

export function getClipPath(videoId, filename) {
    return path.join(OUTPUT_DIR, videoId, filename);
}
