import bcrypt from 'bcryptjs';
import { db } from '../db';
import { hospitals } from '../db/schema';
import { isEmailTaken } from './auth.service';

export async function createHospital(data: {
  name: string;
  adminEmail: string;
  password: string;
  city?: string;
  state?: string;
  phone?: string;
}) {
  const email = data.adminEmail.trim().toLowerCase();

  if (await isEmailTaken(email)) {
    const error: any = new Error('Admin email address is already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const [newHospital] = await db
    .insert(hospitals)
    .values({
      name: data.name.trim(),
      adminEmail: email,
      passwordHash,
      city: data.city || null,
      state: data.state || null,
      phone: data.phone || null,
    })
    .returning({
      id: hospitals.id,
      name: hospitals.name,
      adminEmail: hospitals.adminEmail,
      city: hospitals.city,
      state: hospitals.state,
      phone: hospitals.phone,
      createdAt: hospitals.createdAt,
    });

  return newHospital;
}

export async function listHospitals() {
  const results = await db
    .select({
      id: hospitals.id,
      name: hospitals.name,
      adminEmail: hospitals.adminEmail,
      city: hospitals.city,
      state: hospitals.state,
      phone: hospitals.phone,
      createdAt: hospitals.createdAt,
    })
    .from(hospitals)
    .orderBy(hospitals.name);

  return results;
}
