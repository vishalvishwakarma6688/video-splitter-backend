import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW) || 60000; // 1 minute
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

export const rateLimiter = rateLimit({
    windowMs,
    max,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED
    },
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path.startsWith('/job-status/');
    },
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            error: 'Too many requests, please try again later',
            code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
            retryAfter: Math.ceil(windowMs / 1000)
        });
    }
});
