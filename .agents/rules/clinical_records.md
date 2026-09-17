# Clinical Records & Longitudinal Access Gating Rules

## 1. Contextual Access Gating Model (The Research Core)
Longitudinal electronic health records in CuraOne are distributed across custodial hospital jurisdictions.
Access to any clinical encounter is governed by a 2-tier security model:

1. **Tier 1: Role-Based Access Control (RBAC)**:
   - Dedicated endpoint paths prevent IDOR (Insecure Direct Object Reference).
   - Clinical Providers (Doctor / Hospital) query `GET /api/patients/:id/timeline`.
   - Patients query their sovereign self-service route `GET /api/patients/me/timeline`.

2. **Tier 2: Attribute & Grant-Based Authorization (ABAC)**:
   When an Attending Doctor queries a patient's timeline:
   - **Own Hospital Jurisdiction (`encounter.hospitalId === doctor.hospitalId`)**:
     - Status: `UNLOCKED`
     - Reason: `CUSTODIAL_OWNER`
     - Full clinical events (conditions, medications, procedures, allergies) are accessible.
   - **External Hospital Jurisdiction (`encounter.hospitalId !== doctor.hospitalId`)**:
     - Checked against the `access_grants` table for an active, approved grant matching `(patientId, requestingHospitalId, targetHospitalId, status='APPROVED')`.
     - **If Active Grant Exists**:
       - Status: `UNLOCKED`
       - Reason: `AUTHORIZED_BY_GRANT`
       - Full clinical events returned.
     - **If No Active Grant**:
       - Status: `LOCKED`
       - Reason: `REQUIRES_CROSS_HOSPITAL_GRANT`
       - Clinical events array is **strictly redacted / empty (`[]`)**.
       - Encounter description is masked to `[Protected Cross-Hospital Record - Access Grant Required]`.
       - Shows timestamp and custodial hospital metadata so the doctor knows which institution holds the relevant history.

3. **Patient Sovereign Access**:
   - The patient is the sovereign owner of their own medical history.
   - `GET /api/patients/me/timeline` unconditionally returns 100% of historical records across all hospitals as `UNLOCKED` with full clinical events.

---

## 2. Active Clinical Endpoints
* `GET /api/patients?search=...`: Search cohort directory with pagination & total encounter counts. Guarded for `DOCTOR`, `HOSPITAL`, `SYSTEM_ADMIN`.
* `GET /api/patients/:id`: Patient demographic profile. Guarded for `DOCTOR`, `HOSPITAL`, `SYSTEM_ADMIN`.
* `GET /api/patients/:id/timeline`: Gated longitudinal timeline for providers. Guarded for `DOCTOR`, `HOSPITAL`.
* `GET /api/patients/me/timeline`: Patient sovereign self-timeline. Guarded strictly for `PATIENT`.
* `GET /api/patients/me/profile`: Patient personal profile. Guarded strictly for `PATIENT`.
* `POST /api/patients/:id/encounters`: Attending doctor records new clinical visit + diagnoses and prescriptions into `encounters` and `clinical_events`. Guarded strictly for `DOCTOR`.

## 3. Cross-Hospital Access Grants Engine (`/api/grants`)
* `POST /api/grants`: Doctor submits record access request for an external hospital's records. Created in `PENDING` status.
* `GET /api/grants`: Auto-scoped by user role:
  - `DOCTOR`: Sees outbound requests initiated by the doctor or their affiliated hospital.
  - `PATIENT`: Sees inbound consent requests for their medical records.
  - `HOSPITAL`: Sees requests where the hospital is the requester or custodial target.
* `GET /api/grants/:id`: Detailed grant record joined with patient, requesting doctor, and custodial hospital.
* `PATCH /api/grants/:id`:
  - `PATIENT` can transition status to `APPROVED` (sets expiration) or `REJECTED`.
  - `PATIENT` or `DOCTOR` can transition status to `REVOKED` at any time to immediately re-lock historical records.

---

## 4. Dual-Key Institutional Governance Model
To prevent unilateral data exfiltration and enforce institutional BAA / HIPAA liability:
* **Key 1 (Patient Sovereign Consent)**: The patient must explicitly consent to sharing their personal health records with the requesting doctor.
* **Key 2 (Target Hospital Custodial Clearance)**: The custodial hospital holding the physical database records must authorize the disclosure, verifying the clinical legitimacy and inter-hospital trust agreements.
* **Unlock Rule**: Records decrypt and unlock **only when both keys are turned**. A rejection or revocation by either party immediately locks access.

---

## 5. Emergency Break-Glass Override & Bi-Lateral Audit Protocol
For incapacitated patients in acute emergency trauma/stroke care where the patient cannot provide consent:
1. **Pre-Access Attestation**:
   - The ER physician must attest under penalty of license suspension and legal prosecution that the patient is incapacitated and acute care is required.
2. **Strict Time Clamping**:
   - Access is auto-clamped to a **strict 24-hour emergency window** (no lingering 30/90-day access).
3. **Bi-Lateral Post-Access Escalation**:
   - **Target Custodian Audit**: Target hospital compliance officer receives an urgent `🚨 Break-Glass Audit Incident` ticket to verify that an emergency visit actually occurred.
   - **Retrospective Patient Notice**: Patient is notified upon recovery with a direct `[ Flag Suspicious Access ]` dispute action.
   - **Host Employing Hospital Escalation**: If the patient or target hospital flags the access as unjustified, the **Doctor's employing hospital (Host Hospital Admin)** is immediately alerted to initiate an internal peer review and suspend the physician's network privileges.

---

## 6. Proposed Schema Evolution Specification (Design Spec - Do Not Implement Yet)
When tracking patient consent and hospital custodial clearance as independent granular entities with incident auditing, the `access_grants` table will evolve as follows:

```typescript
export const accessGrants = pgTable('access_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  requestingDoctorId: uuid('requesting_doctor_id').references(() => doctors.id, { onDelete: 'cascade' }).notNull(),
  requestingHospitalId: uuid('requesting_hospital_id').references(() => hospitals.id, { onDelete: 'cascade' }).notNull(),
  targetHospitalId: uuid('target_hospital_id').references(() => hospitals.id, { onDelete: 'cascade' }).notNull(),
  
  // Overall Consolidated State: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED'
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  purpose: text('purpose').notNull(),

  // Key 1: Sovereign Patient Consent
  patientConsentStatus: varchar('patient_consent_status', { length: 25 }).default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED_BREAK_GLASS'
  patientConsentedAt: timestamp('patient_consented_at'),

  // Key 2: Custodial Hospital Clearance
  hospitalApprovalStatus: varchar('hospital_approval_status', { length: 20 }).default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED'
  hospitalApprovedAt: timestamp('hospital_approved_at'),

  // Emergency Break-Glass Protocol
  isBreakGlass: boolean('is_break_glass').default(false).notNull(),
  breakGlassAttestation: text('break_glass_attestation'),

  // Bi-Lateral Audit & Dispute Tracking
  auditIncidentStatus: varchar('audit_incident_status', { length: 30 }).default('NONE').notNull(), // 'NONE' | 'PENDING_AUDIT' | 'FLAGGED_BY_PATIENT' | 'FLAGGED_BY_TARGET' | 'JUSTIFIED' | 'DISCIPLINARY_ESCALATED'
  auditIncidentNotes: text('audit_incident_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
});
```
> [!NOTE]
> This schema definition is an architectural design specification for documentation and viva defense. No database migration is executed until specifically commanded.
