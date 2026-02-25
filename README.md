# Cognitive OS Chat Starter Template

Generic project starter with:

- `frontend/`: Vite + React starter app (React Router included)
- `backend/`: minimal PHP JSON API starter with a lightweight router

## Quick Start

### 1) Start the backend API

From `backend/`:

```bash
php -S localhost:8000 -t public
```

Available starter endpoints:

- `GET /api/health`
- `GET /api/info`
- `POST /api/echo`

### 2) Start the frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Template Cleanup Notes

- The previous app-specific pages/components are still present in `frontend/src/` for now, but the starter uses only the new generic app entry files.
- `frontend/node_modules` and `frontend/dist` are local/generated and are ignored by `.gitignore`.

## Next Steps

- Replace starter routes in `frontend/src/App.jsx`
- Add your domain models and API endpoints in `backend/src/Controllers`
- Remove old app-specific files once you no longer need them
