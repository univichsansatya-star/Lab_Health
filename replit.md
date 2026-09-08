# UIS Health Lab

## Run on Replit

The preview runs the existing frontend and Express server with:

```bash
cd frontend && npm run dev
```

It listens on `0.0.0.0:5000`, which is the port configured for the Replit web preview.

## Project structure

- `frontend/` — React/Vite UI and Express development server
- `backend/` — Django REST API

The frontend uses Django as its business-data source through the same-origin `/backend-api` proxy. The Django service is kept as a separate backend and can be checked with:

```bash
.pythonlibs/bin/python backend/manage.py check
```

## Environment

- `GEMINI_API_KEY` is an optional Replit Secret used by the frontend server’s `/api/assistant` endpoint. Without it, the rest of the app remains available and the assistant returns its existing configuration message.
- When the `DATABASE`, `USER_DATABASE`, and `PASSWORD_DATABASE` secrets are present, Django uses the legacy MySQL database with `DATABASE_HOST` and `DATABASE_PORT`. Otherwise it falls back to `DATABASE_URL` and then local SQLite.
- The current legacy MySQL connection has been verified with read-only queries. It connects successfully to `n1601520_HealthLab`, but that schema currently exposes no tables, so FE data remains empty until the correct legacy schema is confirmed.