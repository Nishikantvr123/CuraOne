import { pgTable, uuid, text, varchar, timestamp, date, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. HOSPITALS (from organizations.csv)
export const hospitals = pgTable('hospitals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  city: text('city'),
  state: text('state'),
  phone: text('phone'),
  adminEmail: text('admin_email').unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  doctors: many(doctors),
  encounters: many(encounters),
  clinicalEvents: many(clinicalEvents),
}));

// 2. DOCTORS (from providers.csv)
export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  hospitalId: uuid('hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  specialty: text('specialty'),
  gender: varchar('gender', { length: 10 }),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [doctors.hospitalId],
    references: [hospitals.id],
  }),
  encounters: many(encounters),
  accessGrants: many(accessGrants),
}));

// 3. PATIENTS (from patients.csv)
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  birthdate: date('birthdate'),
  gender: varchar('gender', { length: 10 }),
  city: text('city'),
  state: text('state'),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  encounters: many(encounters),
  clinicalEvents: many(clinicalEvents),
  accessGrants: many(accessGrants),
  embeddings: many(clinicalEmbeddings),
}));

// 4. ENCOUNTERS (from encounters.csv)
export const encounters = pgTable('encounters', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  hospitalId: uuid('hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: uuid('doctor_id').references(() => doctors.id, { onDelete: 'set null' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  encounterClass: text('encounter_class'),
  description: text('description'),
  reasonDescription: text('reason_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, {
    fields: [encounters.patientId],
    references: [patients.id],
  }),
  hospital: one(hospitals, {
    fields: [encounters.hospitalId],
    references: [hospitals.id],
  }),
  doctor: one(doctors, {
    fields: [encounters.doctorId],
    references: [doctors.id],
  }),
  clinicalEvents: many(clinicalEvents),
}));

// 5. CLINICAL EVENTS (unified: conditions, medications, allergies, procedures, careplans, immunizations)
export const clinicalEvents = pgTable('clinical_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id').references(() => encounters.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  hospitalId: uuid('hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  eventType: varchar('event_type', { length: 30 }).notNull(), // 'CONDITION' | 'MEDICATION' | 'ALLERGY' | 'PROCEDURE' | 'CAREPLAN' | 'IMMUNIZATION'
  code: text('code'),
  description: text('description').notNull(),
  reasonDescription: text('reason_description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clinicalEventsRelations = relations(clinicalEvents, ({ one }) => ({
  encounter: one(encounters, {
    fields: [clinicalEvents.encounterId],
    references: [encounters.id],
  }),
  patient: one(patients, {
    fields: [clinicalEvents.patientId],
    references: [patients.id],
  }),
  hospital: one(hospitals, {
    fields: [clinicalEvents.hospitalId],
    references: [hospitals.id],
  }),
}));

// 6. ACCESS GRANTS (Cross-hospital authorization model)
export const accessGrants = pgTable('access_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  requestingDoctorId: uuid('requesting_doctor_id')
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  requestingHospitalId: uuid('requesting_hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  targetHospitalId: uuid('target_hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED'
  purpose: text('purpose').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
});

export const accessGrantsRelations = relations(accessGrants, ({ one }) => ({
  patient: one(patients, {
    fields: [accessGrants.patientId],
    references: [patients.id],
  }),
  requestingDoctor: one(doctors, {
    fields: [accessGrants.requestingDoctorId],
    references: [doctors.id],
  }),
  requestingHospital: one(hospitals, {
    fields: [accessGrants.requestingHospitalId],
    references: [hospitals.id],
  }),
  targetHospital: one(hospitals, {
    fields: [accessGrants.targetHospitalId],
    references: [hospitals.id],
  }),
}));

// 7. CLINICAL EMBEDDINGS (pgvector store for RAG)
export const clinicalEmbeddings = pgTable('clinical_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  hospitalId: uuid('hospital_id')
    .references(() => hospitals.id, { onDelete: 'cascade' })
    .notNull(),
  encounterId: uuid('encounter_id').references(() => encounters.id, { onDelete: 'cascade' }),
  chunkText: text('chunk_text').notNull(),
  embedding: vector('embedding', { dimensions: 768 }), // 768 dimensions for Gemini text-embedding-004
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clinicalEmbeddingsRelations = relations(clinicalEmbeddings, ({ one }) => ({
  patient: one(patients, {
    fields: [clinicalEmbeddings.patientId],
    references: [patients.id],
  }),
  hospital: one(hospitals, {
    fields: [clinicalEmbeddings.hospitalId],
    references: [hospitals.id],
  }),
  encounter: one(encounters, {
    fields: [clinicalEmbeddings.encounterId],
    references: [encounters.id],
  }),
}));

// 8. SYSTEM ADMINS (Platform-level superuser)
export const systemAdmins = pgTable('system_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
