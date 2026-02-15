@echo off
echo Starting Redis Server...
echo.

REM Try to start redis-server
where redis-server >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Redis found! Starting server...
    start "Redis Server" redis-server
    timeout /t 3 >nul
    echo Redis server started on port 6379
) else (
    echo Redis server not found in PATH.
    echo.
    echo Please install Redis using one of these methods:
    echo 1. Download from: https://github.com/microsoftarchive/redis/releases
    echo 2. Use WSL: wsl sudo service redis-server start
    echo 3. Use Docker: docker run -d -p 6379:6379 redis
    echo.
    pause
)
