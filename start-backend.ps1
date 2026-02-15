# Video Splitter Backend Startup Script
# This script starts Redis and the backend server

Write-Host "Starting Video Splitter Backend..." -ForegroundColor Cyan

# Redis path
$redisPath = "C:\Users\visha\Downloads\Redis-x64-5.0.14.1\redis-server.exe"

# Check if Redis is already running
$redisRunning = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue

if ($redisRunning) {
    Write-Host "Redis is already running (PID: $($redisRunning.Id))" -ForegroundColor Yellow
} else {
    Write-Host "Starting Redis server..." -ForegroundColor Green
    Start-Process -FilePath $redisPath -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "Redis server started!" -ForegroundColor Green
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
npm run dev
