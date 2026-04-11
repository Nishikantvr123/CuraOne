/**
 * Seed script - creates demo users in MongoDB Atlas
 * Run once: node utils/seedDb.js
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model('User', userSchema);

const DEMO_PASSWORD = 'password123';

const demoUsers = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@curaone.com',
    role: 'patient',
    phone: '+1-555-0123',
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=059669&color=fff',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    email: 'practitioner@curaone.com',
    role: 'practitioner',
    phone: '+1-555-0124',
    specialization: ['Panchakarma', 'Ayurvedic Massage', 'Herbal Medicine'],
    experience: 8,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Dr+Sarah+Smith&background=0284c7&color=fff',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@curaone.com',
    role: 'admin',
    phone: '+1-555-0125',
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

    for (const user of demoUsers) {
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`⏭  Skipping ${user.email} (already exists)`);
        continue;
      }
      await User.create({ ...user, password: hashedPassword });
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('   patient@curaone.com / password123');
    console.log('   practitioner@curaone.com / password123');
    console.log('   admin@curaone.com / password123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
