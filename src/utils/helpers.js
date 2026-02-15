import { YOUTUBE_URL_PATTERNS } from './constants.js';

export function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

export function isValidYouTubeUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    return YOUTUBE_URL_PATTERNS.some(pattern => pattern.test(url.trim()));
}

export function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

export function estimateProcessingTime(videoDuration, clipDuration) {
    const numberOfClips = Math.ceil(videoDuration / clipDuration);
    return Math.max(30, numberOfClips * 2 + 30);
}

export function generateFilename(videoId, clipIndex, extension = 'mp4') {
    return `${videoId}_clip_${clipIndex}.${extension}`;
}

export async function cleanupOldFiles(directory, retentionDays) {
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
        const files = await fs.readdir(directory);
        const now = Date.now();
        const maxAge = retentionDays * 24 * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);

            if (now - stats.mtimeMs > maxAge) {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

export async function ensureDirectory(directory) {
    const fs = await import('fs/promises');

    try {
        await fs.access(directory);
    } catch {
        await fs.mkdir(directory, { recursive: true });
    }
}
