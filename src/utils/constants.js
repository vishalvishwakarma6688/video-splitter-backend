export const SUPPORTED_DURATIONS = [30, 45, 60];

export const YOUTUBE_URL_PATTERNS = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/
];

export const JOB_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

export const ERROR_CODES = {
    INVALID_URL: 'INVALID_URL',
    VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
    VIDEO_TOO_LONG: 'VIDEO_TOO_LONG',
    DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    INVALID_DURATION: 'INVALID_DURATION',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export const HTTP_STATUS = {
    OK: 200,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};
