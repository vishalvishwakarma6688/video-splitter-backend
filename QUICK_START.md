## ⚡ Quick Start - Redis Setup for Windows

You have Redis Insight installed, but you need the Redis server itself.

## 🚀 Fastest Method: Download Redis for Windows

## Option 1: Direct Download (Recommended)

1. **Download Redis for Windows:**
   - Go to: https://github.com/tporadowski/redis/releases
   - Download: `Redis-x64-5.0.14.1.zip` (or latest version)
   - Extract to a folder (e.g., `C:\Redis`)

2. **Start Redis Server:**
   ```cmd
   cd C:\Redis
   redis-server.exe
   ```
   Keep this terminal open!

3. **In a NEW terminal, start the backend:**
   ```cmd
   cd video-splitter-backend
   npm run dev
   ```

---

## Option 2: Using Docker (If you have Docker Desktop)

```bash
# Start Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# Verify it's running
docker ps

# Start backend
cd video-splitter-backend
npm run dev
```

---

## Option 3: Using WSL (Windows Subsystem for Linux)

```bash
# In WSL terminal
sudo apt-get update
sudo apt-get install redis-server
redis-server

# In another terminal, start backend
cd video-splitter-backend
npm run dev
```

---

## ✅ Verify Redis is Running

Open a new terminal and test:
```cmd
# If Redis is in PATH
redis-cli ping

# Or use full path
C:\Redis\redis-cli.exe ping
```

Should return: `PONG`

---

## 🎯 After Redis is Running

1. Keep Redis server terminal open
2. Open a new terminal
3. Navigate to backend: `cd video-splitter-backend`
4. Start backend: `npm run dev`
5. Backend will start on http://localhost:3000

---

## 🔗 Connect Redis Insight

Once Redis server is running:
1. Open Redis Insight
2. Click "+ Add Redis database"
3. Enter:
   - Host: localhost
   - Port: 6379
   - Name: Local Redis
4. Click "Add Database"

Now you can monitor your Redis data visually!
