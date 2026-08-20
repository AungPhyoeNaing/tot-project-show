# 🤖 AI Coding Agent Automated Setup & Installation Guide

This document is specifically structured for **AI Coding Agents** (e.g., OpenCode, Claude Code, Antigravity, Devin, Codex) or developers provisioning a **completely fresh laptop/machine** with zero pre-installed dependencies.

---

## 🎯 Target State

At the end of this protocol, three persistent services must be active and verified:
1. **Laravel API Backend**: `http://127.0.0.1:8000`
2. **Socket.IO Real-Time Server**: `http://localhost:3001`
3. **Vite React Frontend**: `http://localhost:5173`

---

## 🧩 Phase 1: System-Level Package Installation (From Scratch)

Check if core CLI tools exist. If missing, install them using the appropriate OS package manager.

### 🪟 Windows (PowerShell as Administrator or User with WinGet)

```powershell
# 1. Install Git
winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements

# 2. Install Node.js (LTS v20+)
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements

# 3. Install PHP (v8.2+)
winget install --id PHP.PHP.8.2 -e --source winget --accept-source-agreements --accept-package-agreements

# 4. Install Composer
winget install --id Composer.Composer -e --source winget --accept-source-agreements --accept-package-agreements
```

> **CRITICAL PHP Windows Configuration**:
> Locate `php.ini` in the PHP installation folder (e.g., `C:\Program Files\PHP\v8.2` or `%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP...`):
> Ensure the following extensions are uncommented (remove leading `;`):
> ```ini
> extension_dir = "ext"
> extension=curl
> extension=fileinfo
> extension=gd
> extension=mbstring
> extension=openssl
> extension=pdo_sqlite
> extension=sqlite3
> extension=zip
> ```

---

### 🍏 macOS (Homebrew)

```bash
# 1. Install system tools
brew install git node php@8.2 composer

# 2. Link PHP 8.2 into PATH
brew link --force --overwrite php@8.2
```

---

### 🐧 Linux (Ubuntu / Debian)

```bash
# 1. Update and install repository prerequisites
sudo apt-get update
sudo apt-get install -y curl git unzip software-properties-common

# 2. Add Ondrej PHP PPA (for PHP 8.2+)
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update

# 3. Install PHP 8.2 and required extensions
sudo apt-get install -y \
  php8.2-cli \
  php8.2-sqlite3 \
  php8.2-curl \
  php8.2-mbstring \
  php8.2-xml \
  php8.2-zip \
  php8.2-gd \
  php8.2-fileinfo

# 4. Install Node.js (v20+ LTS via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

## 🔍 Phase 2: Verification Checklist

Execute the following commands to confirm environment readiness:

```bash
git --version          # Expected: git version 2.x+
node -v                # Expected: v18.x, v20.x, or v24.x
npm -v                 # Expected: 9.x, 10.x, or 11.x
php -v                 # Expected: PHP 8.2.x or 8.1.x
composer --version     # Expected: Composer 2.x
php -m                 # Must list: pdo_sqlite, sqlite3, curl, fileinfo, openssl, mbstring
```

---

## ⚙️ Phase 3: Automated Step-by-Step Service Setup

Run these commands sequentially from the repository root (`TrendsOfTUM-2025/`).

### Step 3.1: Backend REST API (`api.totumdy.com`)

```bash
cd api.totumdy.com

# 1. Install Composer PHP dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader

# 2. Create .env if missing
if [ ! -f .env ]; then cp .env.example .env; fi
# (On Windows PowerShell: if (!(Test-Path .env)) { Copy-Item .env.example .env })

# 3. Generate Laravel Application Key
php artisan key:generate --force

# 4. Ensure SQLite database file exists
mkdir -p database
touch database/database.sqlite
# (On Windows PowerShell: if (!(Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite -Force })

# 5. Run Database Migrations & Seed Initial Data
php artisan migrate --seed --force

# 6. Create Storage Symlink (CRITICAL for media & avatars)
php artisan storage:link --force

cd ..
```

---

### Step 3.2: Real-time Chat Server (`chat-server-nodejs-v2`)

```bash
cd chat-server-nodejs-v2

# 1. Create .env if missing
if [ ! -f .env ]; then cp .env.example .env; fi
# (On Windows PowerShell: if (!(Test-Path .env)) { Copy-Item .env.example .env })

# 2. Ensure environment keys match
# .env must contain:
# PORT=3001
# NODE_SERVER_KEY=secret-tot-key

# 3. Install Node dependencies
npm install --no-audit --no-fund
# (On Windows PowerShell: npm.cmd install --no-audit --no-fund)

cd ..
```

---

### Step 3.3: Frontend Web Client (`tot-frontend`)

```bash
cd tot-frontend

# 1. Install npm dependencies
npm install --no-audit --no-fund
# (On Windows PowerShell: npm.cmd install --no-audit --no-fund)

# 2. Verify build integrity
npm run build
# (On Windows PowerShell: npm.cmd run build)

cd ..
```

---

## 🚀 Phase 4: Starting All 3 Services

The agent should start each service in a background daemon or separate terminal session:

### Process 1: Laravel API Backend
- **Working Directory**: `api.totumdy.com`
- **Command**: `php artisan serve --host=127.0.0.1 --port=8000`
- **Expected Output**: `Server running on [http://127.0.0.1:8000]`

### Process 2: Real-time Socket Server
- **Working Directory**: `chat-server-nodejs-v2`
- **Command**: `node server.js`
- **Expected Output**: `[Server] Running on port 3001`

### Process 3: React Vite Frontend
- **Working Directory**: `tot-frontend`
- **Command**: `npx vite --host` (or `npm run dev`)
- **Expected Output**: `VITE ready in ... ➜ Local: http://localhost:5173/`

---

## 🧪 Phase 5: Automated Agent Smoke Tests / Health Checks

An agent can verify everything is functioning correctly by running these smoke tests:

### Test 1: Frontend Status (HTTP 200)
```bash
curl -s -I http://localhost:5173 | grep "200 OK"
# (PowerShell: (Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing).StatusCode)
```

### Test 2: Backend API Status (HTTP 401 Unauthorized for unauth, or 200 with token)
```bash
curl -s -I -H "Accept: application/json" http://127.0.0.1:8000/api/posts | grep "401"
```

### Test 3: Backend Login Verification (Test Seeded User)
```bash
# Unix / Linux / macOS
curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"porter98@example.org","password":"password"}'

# Windows PowerShell:
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method Post `
  -Headers @{ "Accept"="application/json"; "Content-Type"="application/json" } `
  -Body '{"email":"porter98@example.org","password":"password"}'
```
*Expected response contains `user` object with `id`, `name`, and Sanctum token.*

### Test 4: Socket.IO Handshake (HTTP 200)
```bash
curl -s "http://localhost:3001/socket.io/?EIO=4&transport=polling" | grep "sid"
```

---

## ⚡ Agent Troubleshooting Cheat Sheet

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `Call to undefined function Illuminate\Database\connect()` or SQLite error | Missing PHP SQLite module | Enable `extension=pdo_sqlite` and `extension=sqlite3` in `php.ini`. |
| `npm.ps1 cannot be loaded... execution policy` | Windows PowerShell script policy restriction | Call `npm.cmd` / `npx.cmd` instead of `npm` / `npx`. |
| Port `8000`, `3001`, or `5173` already in use | Previous process still running in background | Kill existing processes: `Stop-Process -Name node, php -Force` (Windows) or `pkill -f 'node|artisan'` (Linux/Mac). |
| Media images returning 404 | Storage link missing | Run `php artisan storage:link --force` in `api.totumdy.com`. |
| Unauthenticated redirects return 500 error | Route `login` not defined for non-JSON requests | Ensure request headers pass `Accept: application/json`. |
