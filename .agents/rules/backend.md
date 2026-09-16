# Backend Architecture & Engineering Rules

## 1. Architectural Pattern: Controller-Service-Route
Code must strictly adhere to the layered separation of concerns:
```text
HTTP Request
     │
     ▼
Route Layer (src/routes/)
     │  - Binds HTTP verb and URL path
     │  - Mounts route-level middleware (auth, role guards)
     ▼
Controller Layer (src/controllers/)
     │  - Request validation using Zod v4 (e.g. z.email())
     │  - Extracts params, query, body
     │  - Invokes appropriate service method
     │  - Formats and sends HTTP status and JSON response
     ▼
Service Layer (src/services/)
     │  - Pure business logic
     │  - Executes direct Drizzle ORM queries against PostgreSQL
     │  - Returns data objects or throws errors with status codes
     ▼
Database Layer (src/db/)
        - schema.ts: Single source of truth for tables and relations
        - index.ts: PostgreSQL connection pool and Drizzle client
```

## 2. Router Composition
* All API sub-routers must be mounted in `src/routes/index.ts` under the `/api` prefix.
* `src/app.ts` must remain lean (~30 lines), containing only global middlewares (`cors`, `express.json`), the `/api` router mount, 404 fallback, and the global error handler.
* `src/index.ts` is strictly the server entry point that tests the DB connection on boot and manages graceful shutdown (`SIGINT`/`SIGTERM`).

## 3. Performance & Safety Standards
* **Lightweight Health Ping**: `GET /api/health` must remain ultra-lightweight. It only runs `SELECT 1 as connected;` and reports round-trip latency in milliseconds. Never execute `count(*)` in the health ping.
* **Heavy Lookups in Stats**: Heavy aggregations and table row counts belong in dedicated endpoints (e.g., `GET /api/health/stats` or admin dashboard routes).
* **Safe Error Handling**: Never allow uncaught promises to crash the Node process. All controller catch blocks must pass errors to `next(error)` to be handled centrally by `src/middlewares/error.middleware.ts`.
