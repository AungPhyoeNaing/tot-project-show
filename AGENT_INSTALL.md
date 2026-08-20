# TrendsOfTUM-2025 — Automated project-show setup

This is a deterministic setup checklist for a fresh device. It provisions the local React, Laravel, and Socket.IO services without assuming that runtime data is stored in Git.

## Choose the data mode first

If users and posts must be available from every device, use a shared database. Put the same remote database settings in each device’s untracked `api.totumdy.com/.env`; do not create a separate SQLite database on each device.

```dotenv
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=tot_show
DB_USERNAME=tot_app
DB_PASSWORD=use-a-real-secret
FILESYSTEM_DISK=public
```

Git pulls source code, not live database rows or uploaded files. For a single-device presentation, SQLite is fine. To transfer a SQLite presentation manually, copy `api.totumdy.com/database/database.sqlite` and `api.totumdy.com/storage/app/public/` together. Do not run `migrate:fresh` on a database whose users/posts must remain.

For a sanitized demo-only Git snapshot, stop the services and force-add the ignored runtime files, then commit and push them:

```powershell
git add -f api.totumdy.com/database/database.sqlite
git add -f api.totumdy.com/storage/app/public/
git commit -m "Update project-show data snapshot"
git push
```

Another device must pull that commit and run `php artisan migrate`, not `migrate:fresh`. New users/posts are not synchronized until the updated snapshot is committed and pushed. Do not commit real private data, tokens, or production credentials; a shared database is safer for multi-device use.

## Target local services

| Service | Address |
| --- | --- |
| Laravel API | `http://127.0.0.1:8000` |
| Socket.IO server | `http://localhost:3001` |
| React/Vite frontend | `http://localhost:5173` |

## 1. Install prerequisites

Required: Git, Node.js 20+, npm, PHP 8.1+, Composer 2, and PHP extensions `curl`, `fileinfo`, `gd`, `mbstring`, `openssl`, `zip`, plus `pdo_sqlite`/`sqlite3` when using SQLite.

Windows PowerShell (WinGet):

```powershell
winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements
winget install --id PHP.PHP.8.2 -e --source winget --accept-source-agreements --accept-package-agreements
winget install --id Composer.Composer -e --source winget --accept-source-agreements --accept-package-agreements
```

On Windows, enable the PHP extensions in `php.ini` if they are commented out:

```ini
extension=curl
extension=fileinfo
extension=gd
extension=mbstring
extension=openssl
extension=pdo_sqlite
extension=sqlite3
extension=zip
```

Verify:

```powershell
git --version
node --version
npm --version
php --version
composer --version
php -m
```

## 2. Configure and migrate Laravel

PowerShell:

```powershell
Set-Location api.totumdy.com
composer install --no-interaction --prefer-dist --optimize-autoloader
if (!(Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate --force
```

For a new local SQLite demo, edit `.env` so it contains:

```dotenv
APP_ENV=local
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=sqlite
DB_DATABASE=C:/absolute/path/to/repository/api.totumdy.com/database/database.sqlite
FILESYSTEM_DISK=public
FRONTEND_URL=http://localhost:5173
NODE_SERVER_URL=http://localhost:3001
NODE_SERVER_KEY=secret-tot-key
```

Then:

```powershell
if (!(Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite -Force }
php artisan migrate --seed
php artisan storage:link --force
```

For a shared database, set the remote `DB_*` values instead and run `php artisan migrate --seed` only once. On later devices run `php artisan migrate`, not `migrate --seed` or `migrate:fresh`.

## 3. Configure the Socket.IO server

```powershell
Set-Location ../chat-server-nodejs-v2
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd install --no-audit --no-fund
```

Ensure `.env` contains matching values:

```dotenv
PORT=3001
NODE_SERVER_KEY=secret-tot-key
LARAVEL_API_BASE_URL=http://localhost:8000/api
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://totumdy.com,https://www.totumdy.com
```

## 4. Install and build the frontend

```powershell
Set-Location ../tot-frontend
npm.cmd install --no-audit --no-fund
npm.cmd run build
```

For local mode, no frontend `.env` is required. For public-domain mode, create `tot-frontend/.env`:

```dotenv
VITE_API_BASE_URL=https://api.totumdy.com/api
VITE_SERVER_BASE_URL=https://api.totumdy.com
VITE_SOCKET_URL=https://chat.totumdy.com
```

## 5. Start the services

Open three terminals:

```powershell
# Terminal 1
Set-Location api.totumdy.com
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2
Set-Location chat-server-nodejs-v2
node server.js

# Terminal 3
Set-Location tot-frontend
npm.cmd run dev -- --host 0.0.0.0
```

Expected addresses are `127.0.0.1:8000`, `localhost:3001`, and `localhost:5173`.

## 6. Smoke tests

```powershell
(Invoke-WebRequest http://localhost:5173 -UseBasicParsing).StatusCode
(Invoke-WebRequest http://127.0.0.1:8000/api/posts -Headers @{Accept='application/json'} -SkipHttpErrorCheck -UseBasicParsing).StatusCode
(Invoke-WebRequest 'http://localhost:3001/socket.io/?EIO=4&transport=polling' -UseBasicParsing).StatusCode
```

Expected values: `200`, `401`, `200`. Use the frontend registration form for an end-to-end auth test; the current seeders intentionally create random showcase users rather than fixed login credentials.

## 7. Optional public domain

After the three local services are healthy:

```powershell
cloudflared tunnel run tot-server
caddy run --config Caddyfile
```

The public domain still depends on the local machine, Caddy, and the tunnel being online.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| SQLite driver error | Enable `pdo_sqlite` and `sqlite3`, or use the shared DB settings. |
| API connects to MySQL unexpectedly | Confirm `.env` has `DB_CONNECTION=sqlite` for local mode. |
| Users/posts missing on another device | Use the same shared database, or manually transfer the SQLite file and media directory. |
| Media/avatar `404` | Run `php artisan storage:link --force`; verify `FILESYSTEM_DISK=public`. |
| Chat cannot reach API | Verify `LARAVEL_API_BASE_URL`, `NODE_SERVER_URL`, and matching `NODE_SERVER_KEY`. |
| Public domain unavailable | Check local services, Caddy, Cloudflare Tunnel, DNS, and firewall. |
| PowerShell blocks npm | Use `npm.cmd`/`npx.cmd`. |
