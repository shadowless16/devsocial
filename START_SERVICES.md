# How to Start Both Services

## Problem
Next.js is using port 3001 (gamification service's port) because port 3000 is occupied.

## Solution

### Step 1: Kill Process on Port 3000
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Step 2: Start Gamification Service (Terminal 1)
```bash
cd backend-services/gamification
pnpm dev
```
**Should see:** `Gamification service running on port 3001`

### Step 3: Start Next.js (Terminal 2)
```bash
# In root directory
pnpm dev
```
**Should see:** `Local: http://localhost:3000`

## Quick Test

Once both are running:

```bash
# Test gamification service
curl http://localhost:3001/health

# Test Next.js
curl http://localhost:3000
```

## Current Issue
- Port 3000: Occupied by another process (PID 18816)
- Port 3001: Next.js took it (should be gamification service)

**Fix:** Kill process on 3000, then start services in correct order.
