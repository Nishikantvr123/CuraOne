/**
 * CuraOne Database Maintenance Script
 * 
 * Combines all database fix/check utilities into one file.
 * Run with: node utils/maintenance.js [command]
 * 
 * Commands:
 *   check     - Check database status (users, therapies, bookings)
 *   fix       - Fix all id fields for users, therapies, bookings
 *   seed      - Seed demo data (users + therapies)
 *   prices    - Update therapy prices to INR
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env' });

const schema = new mongoose.Schema({}, { strict: false });
const getModel = (collection) => {
  try { return mongoose.model(collection); }
  catch { return mongoose.model(collection, schema, collection); }
};

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas\n');
}

// ─── CHECK ────────────────────────────────────────────────────────────────────
async function checkDatabase() {
  const User = getModel('users');
  const Therapy = getModel('therapies');
  const Booking = getModel('bookings');

  const users = await User.find({}).lean();
  const therapies = await Therapy.find({}).lean();
  const bookings = await Booking.find({}).lean();

  console.log(`👥 Users: ${users.length}`);
  users.forEach(u => {
    console.log(`   ${u.role?.padEnd(12)} | ${u.email} | id: ${u.id || 'MISSING'}`);
  });

  console.log(`\n💊 Therapies: ${therapies.length}`);
  therapies.forEach(t => {
    console.log(`   ${t.name?.padEnd(20)} | ₹${t.price} | id: ${t.id || 'MISSING'}`);
  });

  console.log(`\n📅 Bookings: ${bookings.length}`);
  bookings.forEach(b => {
    console.log(`   ${b.scheduledDate} ${b.scheduledTime} | ${b.status} | id: ${b.id || 'MISSING'}`);
  });
}

// ─── FIX ──────────────────────────────────────────────────────────────────────
async function fixAllIds() {
  const collections = ['users', 'therapies', 'bookings', 'notifications', 'wellness_checkins'];
  let totalFixed = 0;

  for (const col of collections) {
    const Model = getModel(col);
    const docs = await Model.find({}).lean();
    let fixed = 0;

    for (const doc of docs) {
      const idStr = doc._id.toString();
      if (doc.id !== idStr) {
        await Model.updateOne({ _id: doc._id }, { $set: { id: idStr } });
        fixed++;
      }
    }

    if (fixed > 0) {
      console.log(`✅ Fixed ${fixed} documents in '${col}'`);
      totalFixed += fixed;
    } else {
      console.log(`⏭️  '${col}': all ${docs.length} documents OK`);
    }
  }

  console.log(`\n✅ Total fixed: ${totalFixed} documents`);
}

// ─── SEED ─────────────────────────────────────────────────────────────────────
async function seedDatabase() {
  const User = getModel('users');
  const Therapy = getModel('therapies');

  const DEMO_PASSWORD = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

  const demoUsers = [
    { firstName: 'John', lastName: 'Doe', email: 'patient@curaone.com', role: 'patient', phone: '+1-555-0123', isActive: true },
    { firstName: 'Dr. Sarah', lastName: 'Smith', email: 'practitioner@curaone.com', role: 'practitioner', phone: '+1-555-0124', specialization: ['Panchakarma', 'Ayurvedic Massage', 'Herbal Medicine'], experience: 8, isActive: true },
    { firstName: 'Dr. Raj', lastName: 'Patel', email: 'raj.patel@curaone.com', role: 'practitioner', phone: '+1-555-0126', specialization: ['Detox Therapy', 'Wellness Counseling', 'Yoga Therapy'], experience: 10, isActive: true },
    { firstName: 'Dr. Maya', lastName: 'Sharma', email: 'maya.sharma@curaone.com', role: 'practitioner', phone: '+1-555-0127', specialization: ['Shirodhara', 'Abhyanga', 'Marma Therapy'], experience: 6, isActive: true },
    { firstName: 'Dr. Aman', lastName: 'Verma', email: 'aman.verma@curaone.com', role: 'practitioner', phone: '+1-555-0128', specialization: ['Nasya', 'Basti', 'Virechana'], experience: 12, isActive: true },
    { firstName: 'Dr. Priya', lastName: 'Reddy', email: 'priya.reddy@curaone.com', role: 'practitioner', phone: '+1-555-0129', specialization: ['Herbal Medicine', 'Diet Consultation', 'Lifestyle Counseling'], experience: 5, isActive: true },
    { firstName: 'Admin', lastName: 'User', email: 'admin@curaone.com', role: 'admin', phone: '+1-555-0125', isActive: true },
  ];

  for (const userData of demoUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) { console.log(`⏭️  Skipping ${userData.email}`); continue; }
    const _id = new mongoose.Types.ObjectId();
    await User.create({ _id, id: _id.toString(), ...userData, password: hashedPassword });
    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  const therapies = [
    { name: 'Abhyanga', fullName: 'Abhyanga (Full Body Oil Massage)', description: 'Traditional Ayurvedic full-body oil massage', category: 'massage', price: 2500, duration: 60, defaultDuration: 60, isActive: true },
    { name: 'Shirodhara', fullName: 'Shirodhara (Oil Pouring Therapy)', description: 'Continuous stream of warm oil on the forehead', category: 'therapy', price: 3000, duration: 45, defaultDuration: 45, isActive: true },
    { name: 'Panchakarma', fullName: 'Panchakarma (Detox Program)', description: 'Complete Ayurvedic detoxification program', category: 'detox', price: 8000, duration: 90, defaultDuration: 90, isActive: true },
    { name: 'Nasya', fullName: 'Nasya (Nasal Therapy)', description: 'Herbal oil administration through nasal passages', category: 'therapy', price: 1500, duration: 30, defaultDuration: 30, isActive: true },
    { name: 'Swedana', fullName: 'Swedana (Herbal Steam Therapy)', description: 'Herbal steam therapy for detoxification', category: 'therapy', price: 1200, duration: 30, defaultDuration: 30, isActive: true },
  ];

  for (const t of therapies) {
    const existing = await Therapy.findOne({ name: t.name });
    if (existing) { console.log(`⏭️  Skipping therapy: ${t.name}`); continue; }
    const _id = new mongoose.Types.ObjectId();
    await Therapy.create({ _id, id: _id.toString(), ...t });
    console.log(`✅ Created therapy: ${t.name} (₹${t.price})`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Demo Credentials (password: password123):');
  console.log('   patient@curaone.com');
  console.log('   practitioner@curaone.com  (Dr. Sarah Smith)');
  console.log('   raj.patel@curaone.com     (Dr. Raj Patel)');
  console.log('   maya.sharma@curaone.com   (Dr. Maya Sharma)');
  console.log('   aman.verma@curaone.com    (Dr. Aman Verma)');
  console.log('   priya.reddy@curaone.com   (Dr. Priya Reddy)');
  console.log('   admin@curaone.com');
}

// ─── PRICES ───────────────────────────────────────────────────────────────────
async function updatePrices() {
  const Therapy = getModel('therapies');
  const prices = { Abhyanga: 2500, Shirodhara: 3000, Panchakarma: 8000, Nasya: 1500, Swedana: 1200 };

  for (const [name, price] of Object.entries(prices)) {
    const result = await Therapy.updateOne({ name }, { $set: { price, currency: 'INR' } });
    console.log(`${result.modifiedCount > 0 ? '✅' : '⏭️ '} ${name}: ₹${price}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const command = process.argv[2] || 'check';

connect().then(async () => {
  switch (command) {
    case 'check':  await checkDatabase(); break;
    case 'fix':    await fixAllIds(); break;
    case 'seed':   await seedDatabase(); break;
    case 'prices': await updatePrices(); break;
    default:
      console.log('Usage: node utils/maintenance.js [check|fix|seed|prices]');
  }
}).catch(err => {
  console.error('❌ Error:', err.message);
}).finally(() => mongoose.disconnect());
