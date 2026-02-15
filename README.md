# 🎬 Video Splitter Backend

A high-performance Node.js backend API for splitting YouTube videos into shorter clips with caching, queue system, and parallel processing.

## ✨ Features

- 🎥 YouTube video download and processing
- ✂️ Video splitting with FFmpeg
- 🚀 Asynchronous job processing with Bull queue
- 💾 Redis caching for performance
- 🔄 Parallel clip processing
- 📊 Job status tracking
- 🛡️ Rate limiting and security
- 📝 Comprehensive logging
- 🔧 Automatic cleanup of old files

## 🏗️ Architecture

Function-based architecture with modular design:
- **Functions**: Core business logic (download, process, validate, cache)
- **Workers**: Background job processors
- **Routes**: RESTful API endpoints
- **Middleware**: Error handling, rate limiting, CORS
- **Config**: Redis and queue configuration

## 📦 Prerequisites

- Node.js 18+
- Redis 7.0+
- FFmpeg installed and in PATH

### Install FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

## 🚀 Installation

1. **Navigate to backend directory:**
   ```bash
   cd video-splitter-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration**

5. **Start Redis:**
   ```bash
   # Windows (if installed as service)
   redis-server

   # macOS/Linux
   redis-server
   ```

6. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📋 API Endpoints

### 1. Split Video
**POST** `/api/split-video`

Split a YouTube video into clips.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "duration": 30
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "jobId": "uuid-v4",
  "message": "Video processing started",
  "estimatedTime": 60
}
```

### 2. Job Status
**GET** `/api/job-status/:jobId`

Get the status of a processing job.

**Response (200 OK):**
```json
{
  "success": true,
  "jobId": "uuid-v4",
  "status": "completed",
  "progress": 100,
  "clips": [
    {
      "url": "/api/clips/videoId/clip-1.mp4",
      "index": 1,
      "duration": 30
    }
  ]
}
```

### 3. Download Clip
**GET** `/api/clips/:videoId/:filename`

Stream or download a video clip.

**Response:** Video file stream (supports range requests)

### 4. Health Check
**GET** `/api/health`

Check API health status.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12345,
  "services": {
    "redis": "connected",
    "queue": "healthy"
  }
}
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Queue
QUEUE_NAME=video-processing
QUEUE_CONCURRENCY=5

# Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
FILE_RETENTION_DAYS=7

# Video Processing
MAX_VIDEO_DURATION=7200
SUPPORTED_DURATIONS=30,45,60
FFMPEG_THREADS=4

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Cache
CACHE_TTL=86400
```

## 📁 Project Structure

```
video-splitter-backend/
├── src/
│   ├── functions/
│   │   ├── cacheManager.js       # Redis caching
│   │   ├── queueManager.js       # Queue operations
│   │   ├── videoDownloader.js    # YouTube download
│   │   ├── videoProcessor.js     # FFmpeg processing
│   │   └── videoValidator.js     # Input validation
│   ├── workers/
│   │   └── videoWorker.js        # Background processor
│   ├── routes/
│   │   └── videoRoutes.js        # API routes
│   ├── middleware/
│   │   ├── errorHandler.js       # Error handling
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── cors.js               # CORS config
│   ├── config/
│   │   ├── redis.js              # Redis setup
│   │   └── queue.js              # Queue setup
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── helpers.js            # Utilities
│   │   └── constants.js          # Constants
│   └── app.js                    # Main app
├── uploads/                      # Temp downloads
├── output/                       # Processed clips
├── logs/                         # Log files
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔄 Processing Flow

1. Client sends POST request to `/api/split-video`
2. Backend validates YouTube URL and video
3. Checks Redis cache for existing results
4. If not cached, adds job to Bull queue
5. Returns job ID to client (202 Accepted)
6. Worker picks up job from queue
7. Downloads video using ytdl-core
8. Splits video using FFmpeg (parallel processing)
9. Stores clips in output directory
10. Caches results in Redis
11. Cleans up temporary files
12. Client polls `/api/job-status/:jobId` for updates
13. Client downloads clips via `/api/clips/:videoId/:filename`

## 🎯 Best Practices Implemented

### 1. Caching
- Redis caching for processed videos
- 24-hour TTL
- Cache key: `video:{videoId}:{duration}`

### 2. Queue System
- Bull queue with Redis backend
- Job retry with exponential backoff
- Configurable concurrency
- Job progress tracking

### 3. Parallel Processing
- Multiple clips processed concurrently
- Configurable FFmpeg threads
- Optimized for CPU cores

### 4. Error Handling
- Global error handler
- Graceful degradation
- Comprehensive logging
- Automatic cleanup on failure

### 5. Security
- Helmet for security headers
- CORS whitelist
- Rate limiting (10 req/min)
- Input validation with Joi
- Request size limits

### 6. Performance
- Response compression
- Streaming for large files
- Connection pooling
- Optimized FFmpeg settings

## 📊 Monitoring

### Logs
Logs are stored in `./logs/` directory:
- `app.log` - All logs
- `error.log` - Error logs only

### Queue Monitoring
Check queue health via `/api/health` endpoint.

## 🧹 Maintenance

### Automatic Cleanup
- Old files cleaned up every 24 hours
- Retention period: 7 days (configurable)
- Applies to both uploads and output directories

### Manual Cleanup
```bash
# Clean uploads
rm -rf uploads/*

# Clean output
rm -rf output/*

# Clean logs
rm -rf logs/*
```

## 🐛 Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
```

### FFmpeg Not Found
```bash
# Check FFmpeg installation
ffmpeg -version

# Add to PATH if needed
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Queue Not Processing
```bash
# Check Redis connection
# Check worker logs
# Restart server
```

## 📝 Development

### Run in Development Mode
```bash
npm run dev
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure production Redis instance
3. Set appropriate `ALLOWED_ORIGINS`
4. Use process manager (PM2, systemd)
5. Set up reverse proxy (Nginx)
6. Configure SSL/TLS
7. Set up monitoring and alerts

### Using PM2
```bash
npm install -g pm2
pm2 start src/app.js --name video-splitter-backend
pm2 save
pm2 startup
```

## 📚 API Documentation

For detailed API documentation, see [BACKEND_REQUIREMENTS.md](../BACKEND_REQUIREMENTS.md)

## 🤝 Contributing

1. Follow the existing code structure
2. Use ESLint and Prettier
3. Add comprehensive logging
4. Handle errors gracefully
5. Update documentation

## 📄 License

MIT

## 🆘 Support

For issues or questions, please check:
1. Logs in `./logs/` directory
2. Redis connection status
3. FFmpeg installation
4. Environment configuration

---

Built with ❤️ using Node.js, Express, Bull, Redis, and FFmpeg
