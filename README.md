# CognitiveOS

Memory-aware personal AI assistant with:

- `frontend/`: Vite + React product demo for chat, memory dashboard, and history
- `backend/`: PHP JSON API for conversations, memory extraction, memory retrieval, and deletion

## Quick Start

### 1) Start the backend API

From `backend/`:

```bash
php -S localhost:8000 -t public
```

Available endpoints:

- `GET /api/health`
- `POST /api/chat`
- `GET /api/conversations?user_id=demo-user`
- `GET /api/memories?user_id=demo-user`
- `DELETE /api/memories/:id`

Apply the SQL schema before running the full demo:

- `001_create_conversations.sql`
- `002_create_memory_events.sql`
- `003_add_active_to_memory_events.sql`

### 2) Start the frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Demo Flow

1. Tell CognitiveOS a preference, goal, or commitment.
2. Open the memory dashboard to see extracted memory events.
3. Ask a follow-up question that depends on prior context.
4. Show retrieved memories in the latest response.
5. Delete a memory to demonstrate user control.
