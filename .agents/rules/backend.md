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

## 2. Router Composition & Mounted Endpoints
All API sub-routers are mounted in `src/routes/index.ts` under the `/api` prefix:
* `/api/auth`: Login (`POST /login`), patient registration (`POST /register`), current session (`GET /me`).
* `/api/patients`:
  - `GET /`: Search directory with pagination & total encounter counts.
  - `GET /:id`: Demographic profile.
  - `GET /:id/timeline`: Provider gated longitudinal timeline.
  - `GET /me/timeline`: Patient sovereign self-timeline (100% unlocked).
  - `GET /me/profile`: Patient self profile.
  - `POST /:id/encounters`: Live clinical encounter entry (Doctor only).
* `/api/grants`:
  - `POST /`: Doctor requests cross-hospital record access (PENDING).
  - `GET /`: Scoped access grants list (Doctor/Patient/Hospital).
  - `GET /:id`: Detailed grant data with joined institutions.
  - `PATCH /:id`: Grant state machine transition (APPROVED, REJECTED, REVOKED).
* `/api/hospitals`:
  - `POST /doctors`: Hospital admin provisions attending doctor.
  - `GET /doctors`: List doctors affiliated with hospital.
* `/api/admin`:
  - `POST /hospitals`: System admin provisions hospital node.
  - `GET /hospitals`: List all registered hospital nodes.
* `/api/health`:
  - `GET /`: Lightweight DB ping (<5ms round-trip).
  - `GET /stats`: Aggregated database counts.

## 3. Database Schema Tables (`src/db/schema.ts`)
* `hospitals`: Institutional data custodians with credentials, jurisdictions, and coordinates.
* `doctors`: Attending medical personnel associated with a custodial hospital.
* `patients`: Cohort individuals with sovereign rights to their medical records.
* `encounters`: Clinical interactions (Ambulatory, Emergency, Inpatient) tied to a patient, hospital, and doctor.
* `clinical_events`: Unified table for diagnoses, medications, procedures, allergies, and observations.
* `access_grants`: Dynamic consent contracts controlling cross-hospital record unlocking.
* `embeddings`: 768-dimension pgvector store for semantic RAG (Gemini embeddings).

## 4. API Response Contract & Defensive Aliasing
To prevent property mismatches across frontend consumers:
* **Patient Search**: Always returns `{ patients, patientList, pagination }`. Each item provides both `totalEncounters` and `encounterCount`.
* **Timeline Summary**: Always returns `{ totalEncounters, unlockedCount, unlockedEncounters, lockedCount, lockedEncounters, totalHospitalsInvolved, hospitalsInvolved }`.
* **Safe Error Handling**: All controllers catch errors and pass them to `next(error)` to be formatted uniformly by `src/middlewares/error.middleware.ts`.
