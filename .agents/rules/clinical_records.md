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

## 2. Active Endpoints
* `GET /api/patients?search=...`: Search cohort directory with pagination & total encounter counts. Guarded for `DOCTOR`, `HOSPITAL`, `SYSTEM_ADMIN`.
* `GET /api/patients/:id`: Patient demographic profile. Guarded for `DOCTOR`, `HOSPITAL`, `SYSTEM_ADMIN`.
* `GET /api/patients/:id/timeline`: Gated longitudinal timeline for providers. Guarded for `DOCTOR`, `HOSPITAL`.
* `GET /api/patients/me/timeline`: Patient sovereign self-timeline. Guarded strictly for `PATIENT`.
* `GET /api/patients/me/profile`: Patient personal profile. Guarded strictly for `PATIENT`.
* `POST /api/patients/:id/encounters`: Attending doctor records new clinical visit + diagnoses and prescriptions into `encounters` and `clinical_events`. Guarded strictly for `DOCTOR`.
