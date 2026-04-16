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
    firstName: 'Dr. Raj',
    lastName: 'Patel',
    email: 'raj.patel@curaone.com',
    role: 'practitioner',
    phone: '+1-555-0126',
    specialization: ['Detox Therapy', 'Wellness Counseling', 'Yoga Therapy'],
    experience: 10,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Dr+Raj+Patel&background=0891b2&color=fff',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Dr. Maya',
    lastName: 'Sharma',
    email: 'maya.sharma@curaone.com',
    role: 'practitioner',
    phone: '+1-555-0127',
    specialization: ['Shirodhara', 'Abhyanga', 'Marma Therapy'],
    experience: 6,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Dr+Maya+Sharma&background=8b5cf6&color=fff',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Dr. Aman',
    lastName: 'Verma',
    email: 'aman.verma@curaone.com',
    role: 'practitioner',
    phone: '+1-555-0128',
    specialization: ['Nasya', 'Basti', 'Virechana'],
    experience: 12,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Dr+Aman+Verma&background=ec4899&color=fff',
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Dr. Priya',
    lastName: 'Reddy',
    email: 'priya.reddy@curaone.com',
    role: 'practitioner',
    phone: '+1-555-0129',
    specialization: ['Herbal Medicine', 'Diet Consultation', 'Lifestyle Counseling'],
    experience: 5,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Dr+Priya+Reddy&background=f59e0b&color=fff',
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
    console.log('\n📋 PATIENT ACCOUNT:');
    console.log('   patient@curaone.com / password123');
    console.log('\n👨‍⚕️ PRACTITIONER ACCOUNTS:');
    console.log('   practitioner@curaone.com / password123 (Dr. Sarah Smith)');
    console.log('   raj.patel@curaone.com / password123 (Dr. Raj Patel)');
    console.log('   maya.sharma@curaone.com / password123 (Dr. Maya Sharma)');
    console.log('   aman.verma@curaone.com / password123 (Dr. Aman Verma)');
    console.log('   priya.reddy@curaone.com / password123 (Dr. Priya Reddy)');
    console.log('\n👑 ADMIN ACCOUNT:');
    console.log('   admin@curaone.com / password123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
