@echo off
REM Video Splitter Backend Startup Script
REM This script starts Redis and the backend server

echo Starting Video Splitter Backend...
echo.

REM Check if Redis is already running
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Redis is already running
) else (
    echo Starting Redis server...
    start /MIN "Redis Server" "C:\Users\visha\Downloads\Redis-x64-5.0.14.1\redis-server.exe"
    timeout /t 2 /nobreak >nul
    echo Redis server started!
)

echo.
echo Starting backend server...
npm run dev
