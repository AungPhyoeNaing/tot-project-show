# TrendsOfTUM-2025 — Project-show runbook

This guide runs the three application services on one machine and optionally exposes them through the public domain.

## Architecture

| Service | Directory | Local address |
| --- | --- | --- |
| React/Vite frontend | `tot-frontend/` | `http://localhost:5173` |
| Laravel API | `api.totumdy.com/` | `http://127.0.0.1:8000` |
| Socket.IO server | `chat-server-nodejs-v2/` | `http://localhost:3001` |

Optional public routing is:

```text
https://totumdy.com       -> localhost:5173
https://api.totumdy.com   -> localhost:8000
https://chat.totumdy.com  -> localhost:3001
```

Cloudflare Tunnel forwards traffic to the local machine and Caddy performs the host-based reverse proxying. The application is still running locally; stopping the local processes or tunnel makes the public domain unavailable.

## Data persistence — important

Git stores source code, migrations, and seeders. It does not automatically store runtime users, posts, messages, uploaded media, or Sanctum tokens.

Choose one of these modes:

### Shared-data mode (recommended for multiple devices)

Use one reachable MySQL/MariaDB/PostgreSQL database and configure the same database credentials in each device’s untracked `api.totumdy.com/.env`. The database, not Git, becomes the source of truth, so registered users and posts remain available from every device.

Uploaded media must also use shared storage (a shared disk, NAS, or S3-compatible bucket). Local `storage/app/public` is only local to one machine.

Example MySQL settings:

```dotenv
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=tot_show
DB_USERNAME=tot_app
DB_PASSWORD=use-a-real-secret
FILESYSTEM_DISK=public
```

### Local-demo mode

SQLite is convenient for a single-machine presentation. It persists on that machine, but a new clone creates a different database. Run `php artisan migrate --seed` only for a new database; use `php artisan migrate` for an existing database. Never use `migrate:fresh` if you need to preserve users or posts.

### Manual transfer mode

To move a local demo to another device, stop Laravel, copy the SQLite file and `api.totumdy.com/storage/app/public/`, then restore both before starting the services. Committing a live SQLite file to Git is possible for a small demo, but it creates merge conflicts and can expose user data; it is not a shared live database.

If Git-only portability is required for a sanitized project snapshot, stop the services and force-add the ignored runtime files:

```bash
git add -f api.totumdy.com/database/database.sqlite
git add -f api.totumdy.com/storage/app/public/
git commit -m "Update project-show data snapshot"
git push
```

On another device, pull the commit, copy the snapshot into the same paths, run `php artisan migrate` (not `migrate:fresh`), and log in again. New users/posts only become available to other devices after the updated snapshot is committed and pushed. Never use this mode with real private data or production credentials; shared-data mode is the correct multi-device solution.

## Prerequisites

- PHP 8.1+, Composer 2
- Node.js 20+ and npm
- Git
- PHP extensions: `pdo_sqlite`/`sqlite3` for SQLite, plus `curl`, `fileinfo`, `gd`, `mbstring`, `openssl`, `zip`
- Optional public mode: Caddy, `cloudflared`, and DNS/tunnel configuration

## First-time setup

### 1. Laravel API

```bash
cd api.totumdy.com
composer install --no-interaction --prefer-dist --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

For local SQLite, edit `.env`:

```dotenv
APP_ENV=local
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/api.totumdy.com/database/database.sqlite
FILESYSTEM_DISK=public
FRONTEND_URL=http://localhost:5173
NODE_SERVER_URL=http://localhost:3001
NODE_SERVER_KEY=secret-tot-key
```

Create the SQLite file if needed:

```bash
mkdir -p database
touch database/database.sqlite
```

PowerShell:

```powershell
if (!(Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite -Force }
```

Then run:

```bash
php artisan migrate --seed
php artisan storage:link
```

For an existing database, use `php artisan migrate` instead of `migrate --seed`.

### 2. Socket.IO server

```bash
cd ../chat-server-nodejs-v2
npm install --no-audit --no-fund
```

Create `.env`:

```dotenv
PORT=3001
NODE_SERVER_KEY=secret-tot-key
LARAVEL_API_BASE_URL=http://localhost:8000/api
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://totumdy.com,https://www.totumdy.com
```

### 3. React frontend

```bash
cd ../tot-frontend
npm install --no-audit --no-fund
npm run build
```

Local development needs no frontend environment overrides. For public-domain development, create `.env` before starting Vite:

```dotenv
VITE_API_BASE_URL=https://api.totumdy.com/api
VITE_SERVER_BASE_URL=https://api.totumdy.com
VITE_SOCKET_URL=https://chat.totumdy.com
```

## Start the services

Use three terminals:

```bash
# Terminal 1
cd api.totumdy.com
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2
cd chat-server-nodejs-v2
node server.js

# Terminal 3
cd tot-frontend
npm run dev -- --host 0.0.0.0
```

On Windows PowerShell, use `npm.cmd` if the execution policy blocks `npm`:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

## Optional public-domain mode

With all three local services running:

```bash
cloudflared tunnel run tot-server
caddy run --config Caddyfile
```

Confirm the tunnel routes the three hostnames to the local Caddy instance. Use `https://totumdy.com` only after the local frontend, API, chat server, tunnel, and Caddy are all running.

## Smoke checks

```powershell
(Invoke-WebRequest http://localhost:5173 -UseBasicParsing).StatusCode
(Invoke-WebRequest http://127.0.0.1:8000/api/posts -Headers @{Accept='application/json'} -SkipHttpErrorCheck -UseBasicParsing).StatusCode
(Invoke-WebRequest 'http://localhost:3001/socket.io/?EIO=4&transport=polling' -UseBasicParsing).StatusCode
```

Expected results are `200`, `401`, and `200` respectively. The API `401` confirms Sanctum protection is active. Use the frontend registration form for a real login test; seeders create random showcase users rather than fixed email addresses.

## Troubleshooting

- `could not find driver`: enable `pdo_sqlite`/`sqlite3`, or verify remote database credentials.
- Media/avatar `404`: run `php artisan storage:link` and confirm `FILESYSTEM_DISK=public`.
- Chat cannot reach Laravel: verify `LARAVEL_API_BASE_URL`, `NODE_SERVER_URL`, and `NODE_SERVER_KEY`.
- Public domain unavailable: verify all three local services, Caddy, Cloudflare Tunnel, DNS, and firewall rules.
- Data missing on another device: local SQLite and local media are machine-specific; use shared-data mode or manually transfer the database and media directory.
