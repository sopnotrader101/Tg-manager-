# TG Manager

A web-based Telegram account management dashboard. Manage multiple Telegram accounts simultaneously — log in, view active sessions, disable 2FA, change emails, send messages, and join channels.

## Run & Operate

- `cd artifacts/tg-python && PORT=5000 python server.py` — start the FastAPI server (port 5000)

## Stack

- **Backend:** Python 3.12, FastAPI, uvicorn, Telethon (MTProto)
- **Frontend:** Vanilla JS / HTML / CSS (served as static files by FastAPI)
- **Database:** SQLite (`artifacts/tg-python/accounts.db`) — stores account metadata
- **Sessions:** Telethon `.session` files stored in `artifacts/tg-python/sessions/`

## Where things live

- `artifacts/tg-python/server.py` — main FastAPI entry point
- `artifacts/tg-python/static/` — frontend (index.html, script.js, style.css)
- `artifacts/tg-python/sessions/` — Telethon session files (one per account)
- `artifacts/tg-python/accounts.db` — SQLite DB for account metadata
- `artifacts/tg-python/requirements.txt` — Python dependencies

## Architecture decisions

- FastAPI serves both the REST API (`/api/*`) and the static frontend from a single process.
- Telegram API credentials (`API_ID`, `API_HASH`) are hardcoded in `server.py` — move to env vars for production.
- SQLite is used for simplicity; no external DB required.
- Pending login sessions (awaiting code verification) are held in-memory with a 10-minute TTL.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `sessions/` directory must exist before the server starts (auto-created by `server.py`).
- Session files persist across restarts; deleting them logs out those accounts on Telegram.
