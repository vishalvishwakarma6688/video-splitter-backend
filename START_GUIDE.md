# Backend Startup Guide

## Quick Start

You now have multiple ways to start the backend (Redis + Backend Server):

### Option 1: Using npm script (Recommended)
```bash
npm run start:all
```

### Option 2: Using PowerShell script
```powershell
.\start-backend.ps1
```

### Option 3: Using Batch file
```cmd
start-backend.bat
```

### Option 4: Double-click
Simply double-click `start-backend.bat` in Windows Explorer

## What These Scripts Do

1. Check if Redis is already running
2. Start Redis server if not running (minimized window)
3. Start the backend server with nodemon (hot reload)

## Manual Start (Old Way)

If you prefer to start services manually:

```powershell
# Terminal 1: Start Redis
C:\Users\visha\Downloads\Redis-x64-5.0.14.1\redis-server.exe

# Terminal 2: Start Backend
npm run dev
```

## Stopping Services

### Stop Backend
Press `Ctrl + C` in the terminal running the backend

### Stop Redis
```powershell
# Find Redis process
Get-Process redis-server

# Stop Redis
Stop-Process -Name "redis-server"
```

Or use Task Manager to end the `redis-server.exe` process.

## Troubleshooting

### Redis Path Error
If you get an error about Redis not found, update the path in:
- `start-backend.ps1` (line 7)
- `start-backend.bat` (line 13)

Change to your actual Redis path.

### PowerShell Execution Policy Error
If you get "execution policy" error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If port 3000 or 6379 is already in use:
1. Stop the conflicting process
2. Or change the port in `.env` file

## Environment Variables

Make sure your `.env` file has:
```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
FFMPEG_PATH=C:/ffmpeg-8.0.1-essentials_build/bin/ffmpeg.exe
FFPROBE_PATH=C:/ffmpeg-8.0.1-essentials_build/bin/ffprobe.exe
```

## Complete Startup (Frontend + Backend)

### Terminal 1: Backend
```bash
cd video-splitter-backend
npm run start:all
```

### Terminal 2: Frontend
```bash
cd video-splitter-frontend
npm run dev
```

Then open: http://localhost:5173

## Services Status

After starting, verify services are running:

### Check Redis
```bash
redis-cli ping
# Should return: PONG
```

### Check Backend
Open: http://localhost:3000/api/health

Should return:
```json
{
  "success": true,
  "status": "healthy",
  ...
}
```

### Check Frontend
Open: http://localhost:5173

You should see the Video Splitter interface.

## All Services Running

✅ Redis Server - Port 6379
✅ Backend API - Port 3000  
✅ Frontend UI - Port 5173

Happy video splitting! 🎬✂️
