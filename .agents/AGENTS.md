# CuraOne - Agent Guidelines & Project Memory

## 1. Project Purpose & Research Core
**CuraOne** is a healthcare research / Final Year Project (FYP) prototype focused on secure, cross-hospital access to longitudinal patient medical records, with a gated RAG clinical retrieval layer.

### Core Research Chain:
1. **Multi-Hospital Network**: Hospitals act as data custodians for longitudinal records.
2. **Contextual Authorization**: Doctors requesting records from another hospital must be granted an active `access_grant` (patient consent / institutional policy).
3. **Authorized Semantic RAG**: Vector similarity search strictly queries *only* records from authorized hospitals. Never retrieve across all hospitals and filter later.
4. **Citations & Grounding**: The LLM synthesizes clinical answers with direct source citations to authorized hospital records.

---

## 2. Core Technology Stack
* **Runtime & Framework**: Node.js, Express, TypeScript (TS 7.x, CommonJS/ES2022).
* **Database & ORM**: PostgreSQL (`curaone_db`), Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
* **Vector Store**: `pgvector` with **768 dimensions** (aligned with Google Gemini `text-embedding-004`).
* **Validation**: Zod v4 (use `z.email()` directly).
* **Authentication**: Standard JWT (`jsonwebtoken`) with `Bearer <token>` headers + `bcryptjs` password hashing.
* **Testing & Scripting**: `tsx` for running scripts (`npm run db:seed`, `npm run dev`).

---

## 3. Modular Rule Index
Detailed implementation rules are modularized in the `.agents/rules/` directory:
* **[Backend Architecture](file:///d:/CuraOne-fyp/.agents/rules/backend.md)**: Layered Controller-Service-Route pattern, router mounting under `/api`, lightweight health ping rules, error handling.
* **[Authentication & Roles](file:///d:/CuraOne-fyp/.agents/rules/auth.md)**: 4 actor roles (`SYSTEM_ADMIN`, `HOSPITAL`, `DOCTOR`, `PATIENT`), hospital admin credentials directly on `hospitals`, JWT payload, demo password `password123`.
* **[Dataset & Clinical Events](file:///d:/CuraOne-fyp/.agents/rules/dataset.md)**: Synthea 69-patient cohort selection, 2-pass multi-hospital scouting algorithm, unified `clinical_events` design, idempotent seed script.
* **[Frontend Architecture](file:///d:/CuraOne-fyp/.agents/rules/frontend.md)**: Vite 8 + React 19 + shadcn radix-nova, object-based routing, TanStack Query, next-themes, monochrome icon standards.
* **[Clinical Records & Access Gating](file:///d:/CuraOne-fyp/.agents/rules/clinical_records.md)**: Two-tier RBAC/ABAC authorization, provider timeline custodial gating (UNLOCKED vs LOCKED), patient sovereign self-access, live encounter ingestion.

---

## 4. Subsystems Roadmap
* [x] **Data Persistence & Ingestion**: PostgreSQL, Drizzle ORM, multi-hospital Synthea cohort.
* [x] **Express Server Foundation**: Layered Controller-Service-Route setup, lightweight health check.
* [x] **Authentication Engine**: Multi-role JWT login, password hashing, `authenticate` and `requireRole` middlewares.
* [x] **Vertical Slice 1 (Frontend Foundation & Auth)**: Vite 8 + React 19 + Tailwind v4 + shadcn radix-nova, object-based router, TanStack Query, Axios JWT interceptors, one-click demo role switchers, and session guarding.
* [x] **Patient Directory & Longitudinal Timeline (Backend)**: Patient search, timeline aggregation, and hospital-scoped record access (Locked vs Unlocked).
* [x] **Cross-Hospital Authorization (Access Grants)**: Request, approval/rejection, expiration, and revocation state machine with automatic timeline unlocking.
* [x] **Vertical Slice 2 (Doctor Clinical Workstation UI)**: Facility jurisdiction sidebar, theme dropdown, patient search directory, longitudinal timeline with locked/unlocked cards, encounter detail modal, live visit logging modal, and cross-hospital access grant modal.
* [x] **Vertical Slice 2.5 (Hospital Admin Workstation UI)**: Institutional node sidebar, medical staff directory with doctor provisioning modal, separated Outbound Doctor Requests and Inbound Record Disclosures with status filter pills (All, Pending, Approved, Expired, Revoked), and facility node info.
* [x] **Vertical Slice 3 (Patient Consent & Identity Portal)**: Normalized Dual-Key authorization engine (`access_requests`, `patient_consents`, `hospital_clearances`), 100% unlocked sovereign patient timeline, consent request inbox, Emergency Break-Glass override with 24-hour clamp, and retrospective dispute escalation loop.
* [ ] **Vertical Slice 4 (Semantic Retrieval & RAG Pipeline)**: Narrative clinical chunking, Gemini embeddings, gated pgvector search, LLM synthesis with citations.

---

## 5. Development Philosophy & Pacing
* **No One-Shotting**: Never dump dozens of unverified files. Build in small, verifiable, debugged slices.
* **Talk First**: Discuss requirements, schemas, and trade-offs before writing code.
* **Team Comprehension**: Write clear, readable, standard code that any college teammate can understand and confidently defend in an FYP viva.
