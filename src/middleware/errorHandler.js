import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    const response = {
        success: false,
        error: err.message || 'Internal server error',
        code: err.code || ERROR_CODES.INTERNAL_ERROR
    };

    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (err.statusCode) {
        statusCode = err.statusCode;
    } else if (err.code === ERROR_CODES.INVALID_URL || err.code === ERROR_CODES.INVALID_DURATION) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
    } else if (err.code === ERROR_CODES.VIDEO_NOT_FOUND) {
        statusCode = HTTP_STATUS.NOT_FOUND;
    } else if (err.code === ERROR_CODES.RATE_LIMIT_EXCEEDED) {
        statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
    }

    res.status(statusCode).json(response);
}

export function notFoundHandler(req, res) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Route not found',
        code: ERROR_CODES.NOT_FOUND
    });
}

export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
