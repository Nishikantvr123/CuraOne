import { db } from '../db';
import { accessGrants, patients, hospitals, doctors } from '../db/schema';
import { eq, and, or, desc, isNull, gt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { AuthUserPayload } from '../types/auth.types';

export interface CreateGrantParams {
  patientId: string;
  requestingDoctorId: string;
  requestingHospitalId: string;
  targetHospitalId: string;
  purpose: string;
  durationDays?: number;
}

export type GrantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

// Aliases for joining requesting hospital and target hospital separately
const requestingHospitals = alias(hospitals, 'requesting_hospital');
const targetHospitals = alias(hospitals, 'target_hospital');

/**
 * 1. Doctor creates a new Access Grant request for an external hospital's records
 */
export async function createGrantRequest(params: CreateGrantParams) {
  // Guard 1: Cannot request your own custodial hospital
  if (params.requestingHospitalId === params.targetHospitalId) {
    const err: any = new Error('Cannot request an access grant for your own custodial hospital (records already accessible)');
    err.statusCode = 400;
    throw err;
  }

  // Guard 2: Verify patient exists
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, params.patientId))
    .limit(1);

  if (!patient) {
    const err: any = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }

  // Guard 3: Verify target hospital exists
  const [targetHosp] = await db
    .select({ id: hospitals.id, name: hospitals.name })
    .from(hospitals)
    .where(eq(hospitals.id, params.targetHospitalId))
    .limit(1);

  if (!targetHosp) {
    const err: any = new Error('Target hospital not found');
    err.statusCode = 404;
    throw err;
  }

  // Guard 4: Check if an active or pending grant already exists
  const now = new Date();
  const [existingGrant] = await db
    .select({ id: accessGrants.id, status: accessGrants.status })
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.patientId, params.patientId),
        eq(accessGrants.requestingHospitalId, params.requestingHospitalId),
        eq(accessGrants.targetHospitalId, params.targetHospitalId),
        or(
          eq(accessGrants.status, 'PENDING'),
          and(
            eq(accessGrants.status, 'APPROVED'),
            or(isNull(accessGrants.expiresAt), gt(accessGrants.expiresAt, now))
          )
        )
      )
    )
    .limit(1);

  if (existingGrant) {
    const err: any = new Error(
      `An access grant request is already ${existingGrant.status} for this patient and hospital`
    );
    err.statusCode = 409;
    throw err;
  }

  const durationDays = params.durationDays || 7;
  const initialExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const [created] = await db
    .insert(accessGrants)
    .values({
      patientId: params.patientId,
      requestingDoctorId: params.requestingDoctorId,
      requestingHospitalId: params.requestingHospitalId,
      targetHospitalId: params.targetHospitalId,
      status: 'PENDING',
      purpose: params.purpose,
      expiresAt: initialExpiresAt,
    })
    .returning();

  return {
    grant: created,
    targetHospital: targetHosp,
  };
}

/**
 * 2. List grants automatically filtered based on user role
 */
export async function listGrants(user: AuthUserPayload, statusFilter?: string) {
  let roleCondition;

  if (user.role === 'PATIENT') {
    // Patient sees all grant requests involving their own body/records
    roleCondition = eq(accessGrants.patientId, user.id);
  } else if (user.role === 'DOCTOR') {
    // Doctor sees requests they or their hospital made
    roleCondition = or(
      eq(accessGrants.requestingDoctorId, user.id),
      user.hospitalId ? eq(accessGrants.requestingHospitalId, user.hospitalId) : undefined
    );
  } else if (user.role === 'HOSPITAL') {
    // Hospital admin sees requests where their hospital is requester OR target custodian
    roleCondition = or(
      eq(accessGrants.requestingHospitalId, user.id),
      eq(accessGrants.targetHospitalId, user.id)
    );
  }

  const whereConditions = [];
  if (roleCondition) whereConditions.push(roleCondition);
  if (statusFilter) whereConditions.push(eq(accessGrants.status, statusFilter.toUpperCase()));

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const grantsList = await db
    .select({
      id: accessGrants.id,
      patientId: accessGrants.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientEmail: patients.email,
      requestingDoctorId: accessGrants.requestingDoctorId,
      requestingDoctorName: doctors.name,
      requestingHospitalId: accessGrants.requestingHospitalId,
      requestingHospitalName: requestingHospitals.name,
      targetHospitalId: accessGrants.targetHospitalId,
      targetHospitalName: targetHospitals.name,
      status: accessGrants.status,
      purpose: accessGrants.purpose,
      createdAt: accessGrants.createdAt,
      expiresAt: accessGrants.expiresAt,
      revokedAt: accessGrants.revokedAt,
    })
    .from(accessGrants)
    .leftJoin(patients, eq(accessGrants.patientId, patients.id))
    .leftJoin(doctors, eq(accessGrants.requestingDoctorId, doctors.id))
    .leftJoin(requestingHospitals, eq(accessGrants.requestingHospitalId, requestingHospitals.id))
    .leftJoin(targetHospitals, eq(accessGrants.targetHospitalId, targetHospitals.id))
    .where(whereClause)
    .orderBy(desc(accessGrants.createdAt));

  return grantsList.map((g) => ({
    ...g,
    patientName: `${g.patientFirstName || ''} ${g.patientLastName || ''}`.trim(),
    isExpired: g.expiresAt ? new Date(g.expiresAt) < new Date() : false,
  }));
}

/**
 * 3. Get single grant by ID with authorization verification
 */
export async function getGrantById(grantId: string, user: AuthUserPayload) {
  const [grant] = await db
    .select({
      id: accessGrants.id,
      patientId: accessGrants.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientEmail: patients.email,
      requestingDoctorId: accessGrants.requestingDoctorId,
      requestingDoctorName: doctors.name,
      requestingHospitalId: accessGrants.requestingHospitalId,
      requestingHospitalName: requestingHospitals.name,
      targetHospitalId: accessGrants.targetHospitalId,
      targetHospitalName: targetHospitals.name,
      status: accessGrants.status,
      purpose: accessGrants.purpose,
      createdAt: accessGrants.createdAt,
      expiresAt: accessGrants.expiresAt,
      revokedAt: accessGrants.revokedAt,
    })
    .from(accessGrants)
    .leftJoin(patients, eq(accessGrants.patientId, patients.id))
    .leftJoin(doctors, eq(accessGrants.requestingDoctorId, doctors.id))
    .leftJoin(requestingHospitals, eq(accessGrants.requestingHospitalId, requestingHospitals.id))
    .leftJoin(targetHospitals, eq(accessGrants.targetHospitalId, targetHospitals.id))
    .where(eq(accessGrants.id, grantId))
    .limit(1);

  if (!grant) {
    const err: any = new Error('Access grant not found');
    err.statusCode = 404;
    throw err;
  }

  // Access check
  if (
    user.role === 'PATIENT' && grant.patientId !== user.id ||
    user.role === 'DOCTOR' && grant.requestingDoctorId !== user.id && grant.requestingHospitalId !== user.hospitalId ||
    user.role === 'HOSPITAL' && grant.requestingHospitalId !== user.id && grant.targetHospitalId !== user.id
  ) {
    const err: any = new Error('Unauthorized to view this access grant');
    err.statusCode = 403;
    throw err;
  }

  return {
    ...grant,
    patientName: `${grant.patientFirstName || ''} ${grant.patientLastName || ''}`.trim(),
    isExpired: grant.expiresAt ? new Date(grant.expiresAt) < new Date() : false,
  };
}

/**
 * 4. Update grant status (Approve, Reject, Revoke)
 */
export async function updateGrantStatus(
  grantId: string,
  user: AuthUserPayload,
  newStatus: 'APPROVED' | 'REJECTED' | 'REVOKED',
  durationDays?: number
) {
  const [existing] = await db
    .select()
    .from(accessGrants)
    .where(eq(accessGrants.id, grantId))
    .limit(1);

  if (!existing) {
    const err: any = new Error('Access grant not found');
    err.statusCode = 404;
    throw err;
  }

  // Permission logic based on role
  if (user.role === 'PATIENT') {
    // Patient owns the record -> must be the patient for this grant
    if (existing.patientId !== user.id) {
      const err: any = new Error('You do not have authorization to update consent for this patient');
      err.statusCode = 403;
      throw err;
    }

    if (newStatus === 'APPROVED') {
      if (existing.status !== 'PENDING') {
        const err: any = new Error(`Cannot approve a grant that is currently ${existing.status}`);
        err.statusCode = 400;
        throw err;
      }
      const days = durationDays || 7;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const [updated] = await db
        .update(accessGrants)
        .set({ status: 'APPROVED', expiresAt })
        .where(eq(accessGrants.id, grantId))
        .returning();

      return updated;
    }

    if (newStatus === 'REJECTED') {
      if (existing.status !== 'PENDING') {
        const err: any = new Error(`Cannot reject a grant that is currently ${existing.status}`);
        err.statusCode = 400;
        throw err;
      }

      const [updated] = await db
        .update(accessGrants)
        .set({ status: 'REJECTED' })
        .where(eq(accessGrants.id, grantId))
        .returning();

      return updated;
    }

    if (newStatus === 'REVOKED') {
      if (existing.status !== 'APPROVED') {
        const err: any = new Error(`Cannot revoke a grant that is currently ${existing.status}`);
        err.statusCode = 400;
        throw err;
      }

      const [updated] = await db
        .update(accessGrants)
        .set({ status: 'REVOKED', revokedAt: new Date() })
        .where(eq(accessGrants.id, grantId))
        .returning();

      return updated;
    }
  } else if (user.role === 'DOCTOR') {
    // Doctor can only REVOKE / cancel their own requested grant
    if (existing.requestingDoctorId !== user.id && existing.requestingHospitalId !== user.hospitalId) {
      const err: any = new Error('You can only cancel/revoke grants requested by yourself or your facility');
      err.statusCode = 403;
      throw err;
    }

    if (newStatus !== 'REVOKED') {
      const err: any = new Error('Doctors can only revoke/cancel access grants. Only patients can approve or reject.');
      err.statusCode = 403;
      throw err;
    }

    const [updated] = await db
      .update(accessGrants)
      .set({ status: 'REVOKED', revokedAt: new Date() })
      .where(eq(accessGrants.id, grantId))
      .returning();

    return updated;
  } else {
    const err: any = new Error('Unauthorized to modify access grants');
    err.statusCode = 403;
    throw err;
  }
}
