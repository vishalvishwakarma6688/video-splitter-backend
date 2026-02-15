# 🚀 Quick Setup Guide

## Step 1: Install Redis on Windows

### Option 1: Using Memurai (Recommended for Windows)
Memurai is a Redis-compatible server for Windows.

1. Download Memurai from: https://www.memurai.com/get-memurai
2. Install the downloaded file
3. Memurai will start automatically as a Windows service

### Option 2: Using WSL (Windows Subsystem for Linux)
```bash
# Install WSL if not already installed
wsl --install

# In WSL terminal:
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Option 3: Using Docker (If you have Docker installed)
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

## Step 2: Verify Redis is Running

Open a new terminal and run:
```bash
# If using Memurai or native Redis
redis-cli ping

# Should return: PONG
```

## Step 3: Install Backend Dependencies

```bash
cd video-splitter-backend
npm install
```

## Step 4: Create .env File

```bash
copy .env.example .env
```

## Step 5: Start the Backend

```bash
npm run dev
```

## ✅ Verification

1. Backend should start on http://localhost:3000
2. Check health: http://localhost:3000/api/health
3. You should see Redis status as "connected"

## 🐛 Troubleshooting

### Redis Connection Failed
- Make sure Redis/Memurai is running
- Check if port 6379 is available
- Verify REDIS_HOST and REDIS_PORT in .env

### FFmpeg Not Found
- Download FFmpeg from: https://ffmpeg.org/download.html
- Add FFmpeg to your system PATH
- Restart terminal after installation

### Port 3000 Already in Use
- Change PORT in .env file to another port (e.g., 3001)
