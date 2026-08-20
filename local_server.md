# Local Server & Development Guide: TrendsOfTUM-2025

This document provides complete, step-by-step instructions to set up, configure, serve, and run the **TrendsOfTUM-2025** application on your local machine, including both direct local access (`localhost`) and domain/tunnel access (`totumdy.com`).

---

## 🏗️ Architecture & Ports Overview

The platform consists of three core decoupled services, with optional reverse proxy and tunnel support:

| Service | Directory | Tech Stack | Port / Endpoint |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | `api.totumdy.com` | Laravel 10.x + SQLite + Sanctum | `http://127.0.0.1:8000` |
| **Real-time Chat Server** | `chat-server-nodejs-v2` | Node.js + Express + Socket.IO | `http://localhost:3001` |
| **Frontend Web App** | `tot-frontend` | React 19 / Vite + Tailwind CSS | `http://localhost:5173` |
| **Caddy Reverse Proxy** | Workspace Root | Caddy (Local HTTPS / TLS) | `https://totumdy.com` |
| **Cloudflare Tunnel** | `tot-server` | `cloudflared` | Edge Tunnel to `totumdy.com` |

---

## 📋 Prerequisites

Ensure the following tools are installed and added to your system `PATH`:

- **PHP** (8.1 or higher, recommended 8.2+) with extensions enabled:
  - `pdo_sqlite`, `sqlite3`, `curl`, `fileinfo`, `gd`, `openssl`, `mbstring`, `zip`
- **Composer** (2.x+)
- **Node.js** (v18, v20, or v24+) & **npm**
- **Git**
- *(Optional for domain/tunnel)*: **Caddy Server** and **cloudflared CLI**

> **Windows PowerShell Note**: If running `npm` produces a script execution policy error, use `npm.cmd` / `npx.cmd` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

---

## 🚀 Step-by-Step Setup & Running

### Step 1: Backend API Setup (`api.totumdy.com`)

1. **Navigate to the backend directory:**
   ```bash
   cd api.totumdy.com
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Configure Environment File (`.env`):**
   Ensure your `.env` contains the local settings:
   ```dotenv
   APP_NAME=TrendsOfTUM
   APP_ENV=local
   APP_KEY=base64:2hvc/7fhjawRfHbOAXT5nsm8Ly8Dw0BL8GZuCiCEXnU=
   APP_URL=http://127.0.0.1:8000

   LOG_CHANNEL=stack
   LOG_LEVEL=debug

   DB_CONNECTION=sqlite

   FILESYSTEM_DISK=public
   QUEUE_CONNECTION=sync
   SESSION_DRIVER=file
   SESSION_LIFETIME=120

   FRONTEND_URL=http://localhost:5173
   SANCTUM_STATEFUL_DOMAINS=totumdy.com,api.totumdy.com,chat.totumdy.com,localhost,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173
   SESSION_DOMAIN=localhost
   NODE_SERVER_KEY=secret-tot-key
   ```

4. **Generate Application Key (if not already set):**
   ```bash
   php artisan key:generate
   ```

5. **Initialize SQLite Database & Run Migrations with Seeders:**
   ```bash
   # If database.sqlite doesn't exist:
   # touch database/database.sqlite (or New-Item database/database.sqlite on PowerShell)
   
   php artisan migrate --seed
   ```

6. **Create Public Storage Symlink:**
   *(Critical for user avatars and uploaded images/audio/video to render)*
   ```bash
   php artisan storage:link
   ```

7. **Start the Laravel API Server:**
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```
   > Keep this terminal open.

---

### Step 2: Real-time Chat Server Setup (`chat-server-nodejs-v2`)

1. **Open a new terminal and navigate to the chat server directory:**
   ```bash
   cd chat-server-nodejs-v2
   ```

2. **Install Node dependencies:**
   ```bash
   npm.cmd install
   ```

3. **Configure Environment File (`.env`):**
   Create/verify `.env` in `chat-server-nodejs-v2`:
   ```dotenv
   PORT=3001
   NODE_SERVER_KEY=secret-tot-key
   ```

4. **Start the Chat / WebSocket Server:**
   ```bash
   node server.js
   ```
   > Output should indicate: `[Server] Running on port 3001`. Keep this terminal open.

---

### Step 3: Frontend Web App Setup (`tot-frontend`)

1. **Open a third terminal and navigate to the frontend directory:**
   ```bash
   cd tot-frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm.cmd install
   ```

3. **Start the Vite Development Server:**
   ```bash
   npm.cmd run dev
   # Or directly:
   npx.cmd vite --host
   ```
   > The frontend will be available at: **`http://localhost:5173`**. Keep this terminal open.

---

### Step 4: (Optional) Domain & Tunnel Access (`totumdy.com`)

To access the app via the custom domain `https://totumdy.com` with HTTPS and public tunneling:

#### 1. Start Cloudflare Tunnel:
```bash
# In the root repository directory
cloudflared tunnel run tot-server
```
*(Uses configuration in `C:\Users\stephen\.cloudflared\config.yml` routing to ports 5173, 8000, and 3001)*

#### 2. Start Caddy Local HTTPS Reverse Proxy:
```bash
# In the root repository directory
caddy run --config Caddyfile
```

---

## 🔑 Demo / Seeded User Credentials

You can create a new account from the registration page or log into seeded test accounts:

| Email | Password | Role / Details |
| :--- | :--- | :--- |
| `porter98@example.org` | `password` | Seeded Demo User |
| `rgibson@example.org` | `password` | Seeded Demo User |
| `lyundt@example.net` | `password` | Seeded Demo User |

---

## 🛠️ Quick Diagnostics & Troubleshooting

### 1. Stopping / Cleaning Up Background Ports (Windows PowerShell)
If a port is in use (`8000`, `3001`, `5173`), find and kill the process:
```powershell
# Stop all node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Stop all php processes
Stop-Process -Name php -Force -ErrorAction SilentlyContinue

# Check listening ports
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in @(8000, 3001, 5173, 80, 443) }
```

### 2. Media / Images Not Displaying
Ensure the symbolic link exists between `public/storage` and `storage/app/public`:
```bash
cd api.totumdy.com
php artisan storage:link
```

### 3. Real-Time Chat & Interactions Not Syncing
Verify that:
- `node server.js` is active on port `3001`.
- `NODE_SERVER_KEY` matches between `api.totumdy.com/.env` and `chat-server-nodejs-v2/.env`.
