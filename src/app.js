import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import videoRoutes from './routes/videoRoutes.js';
import { startVideoWorker, stopVideoWorker } from './workers/videoWorker.js';
import { ensureDirectory, cleanupOldFiles } from './utils/helpers.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
const FILE_RETENTION_DAYS = parseInt(process.env.FILE_RETENTION_DAYS) || 7;
const CLEANUP_INTERVAL = parseInt(process.env.CLEANUP_INTERVAL) || 86400000;

const app = express();

app.use(helmet());

// CORS
app.use(corsMiddleware);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// API Routes
app.use('/api', videoRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Video Splitter API',
        version: '1.0.0',
        endpoints: {
            splitVideo: 'POST /api/split-video',
            jobStatus: 'GET /api/job-status/:jobId',
            clips: 'GET /api/clips/:videoId/:filename',
            health: 'GET /api/health'
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Initialize directories
async function initializeDirectories() {
    try {
        await ensureDirectory(UPLOAD_DIR);
        await ensureDirectory(OUTPUT_DIR);
        logger.info('Directories initialized');
    } catch (error) {
        logger.error('Failed to initialize directories:', error);
        process.exit(1);
    }
}

// Setup cleanup scheduler
function setupCleanup() {
    setInterval(async () => {
        logger.info('Running scheduled cleanup...');
        await cleanupOldFiles(OUTPUT_DIR, FILE_RETENTION_DAYS);
        await cleanupOldFiles(UPLOAD_DIR, FILE_RETENTION_DAYS);
    }, CLEANUP_INTERVAL);

    logger.info(`Cleanup scheduled every ${CLEANUP_INTERVAL / 1000 / 60} minutes`);
}

// Start server
async function startServer() {
    try {
        // Initialize directories
        await initializeDirectories();

        // Start video worker
        startVideoWorker();

        // Setup cleanup
        setupCleanup();

        // Start Express server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info('Video Splitter Backend started successfully');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await stopVideoWorker();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await stopVideoWorker();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

export default app;
