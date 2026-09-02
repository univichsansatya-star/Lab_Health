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

The frontend currently uses its configured API service and local demo storage. The Django service is kept as a separate backend and can be checked with:

```bash
.pythonlibs/bin/python backend/manage.py check
```

## Environment

- `GEMINI_API_KEY` is an optional Replit Secret used by the frontend server’s `/api/assistant` endpoint. Without it, the rest of the app remains available and the assistant returns its existing configuration message.
- The Django backend reads `DATABASE_URL` when provided and otherwise falls back to its local SQLite configuration.