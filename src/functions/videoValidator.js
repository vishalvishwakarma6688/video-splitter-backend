import Joi from 'joi';
import ytdl from '@distube/ytdl-core';
import { SUPPORTED_DURATIONS, ERROR_CODES } from '../utils/constants.js';
import { isValidYouTubeUrl, extractVideoId } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const MAX_VIDEO_DURATION = parseInt(process.env.MAX_VIDEO_DURATION) || 7200; // 2 hours

export const videoSplitSchema = Joi.object({
    url: Joi.string().required().messages({
        'string.empty': 'YouTube URL is required',
        'any.required': 'YouTube URL is required'
    }),
    duration: Joi.number()
        .valid(...SUPPORTED_DURATIONS)
        .required()
        .messages({
            'any.only': `Duration must be one of: ${SUPPORTED_DURATIONS.join(', ')}`,
            'any.required': 'Duration is required'
        })
});

export function validateUrlFormat(url) {
    if (!isValidYouTubeUrl(url)) {
        return {
            valid: false,
            error: 'Invalid YouTube URL format',
            code: ERROR_CODES.INVALID_URL
        };
    }

    return { valid: true };
}

export async function validateVideoExists(url) {
    try {
        const videoId = extractVideoId(url);

        if (!videoId) {
            return {
                valid: false,
                error: 'Could not extract video ID from URL',
                code: ERROR_CODES.INVALID_URL
            };
        }

        const isValid = ytdl.validateURL(url);

        if (!isValid) {
            return {
                valid: false,
                error: 'Video not found or not accessible',
                code: ERROR_CODES.VIDEO_NOT_FOUND
            };
        }

        const info = await ytdl.getInfo(url);

        const duration = parseInt(info.videoDetails.lengthSeconds);

        if (duration > MAX_VIDEO_DURATION) {
            return {
                valid: false,
                error: `Video is too long. Maximum duration is ${MAX_VIDEO_DURATION / 60} minutes`,
                code: ERROR_CODES.VIDEO_TOO_LONG
            };
        }

        return {
            valid: true,
            videoId,
            info: {
                title: info.videoDetails.title,
                duration,
                thumbnail: info.videoDetails.thumbnails[0]?.url
            }
        };
    } catch (error) {
        logger.error('Video validation error:', error);

        return {
            valid: false,
            error: 'Failed to validate video. It may be private, age-restricted, or unavailable',
            code: ERROR_CODES.VIDEO_NOT_FOUND
        };
    }
}

export async function validateVideoRequest(url, duration) {
    const { error } = videoSplitSchema.validate({ url, duration });

    if (error) {
        return {
            valid: false,
            error: error.details[0].message,
            code: ERROR_CODES.INVALID_URL
        };
    }

    const formatValidation = validateUrlFormat(url);
    if (!formatValidation.valid) {
        return formatValidation;
    }

    const videoValidation = await validateVideoExists(url);
    if (!videoValidation.valid) {
        return videoValidation;
    }

    return {
        valid: true,
        videoId: videoValidation.videoId,
        info: videoValidation.info
    };
}
