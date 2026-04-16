import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const therapySchema = new mongoose.Schema({}, { strict: false, collection: 'therapies' });
const Therapy = mongoose.model('Therapy', therapySchema);

const therapies = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Abhyanga',
    fullName: 'Abhyanga (Full Body Oil Massage)',
    description: 'Traditional Ayurvedic full-body oil massage using warm herbal oils',
    category: 'massage',
    price: 120,
    duration: 60,
    defaultDuration: 60,
    benefits: ['Improves circulation', 'Reduces stress', 'Nourishes skin'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Shirodhara',
    fullName: 'Shirodhara (Oil Pouring Therapy)',
    description: 'Continuous stream of warm oil poured on the forehead',
    category: 'therapy',
    price: 150,
    duration: 45,
    defaultDuration: 45,
    benefits: ['Calms mind', 'Reduces anxiety', 'Improves sleep'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Panchakarma',
    fullName: 'Panchakarma (Detox Program)',
    description: 'Complete Ayurvedic detoxification and rejuvenation program',
    category: 'detox',
    price: 300,
    duration: 90,
    defaultDuration: 90,
    benefits: ['Deep detoxification', 'Rejuvenation', 'Balances doshas'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Nasya',
    fullName: 'Nasya (Nasal Therapy)',
    description: 'Herbal oil administration through nasal passages',
    category: 'therapy',
    price: 80,
    duration: 30,
    defaultDuration: 30,
    benefits: ['Clears sinuses', 'Improves breathing', 'Relieves headaches'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Swedana',
    fullName: 'Swedana (Herbal Steam Therapy)',
    description: 'Herbal steam therapy for detoxification',
    category: 'therapy',
    price: 70,
    duration: 30,
    defaultDuration: 30,
    benefits: ['Opens pores', 'Eliminates toxins', 'Relaxes muscles'],
    isActive: true
  }
];

async function seedTherapies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    for (const therapy of therapies) {
      const existing = await Therapy.findOne({ name: therapy.name });
      if (existing) {
        console.log(`⏭  Skipping ${therapy.name} (already exists)`);
        continue;
      }
      
      // Add id field matching _id
      therapy.id = therapy._id.toString();
      
      await Therapy.create(therapy);
      console.log(`✅ Created therapy: ${therapy.name}`);
    }

    console.log('\n🎉 Therapies seeded successfully!');
    console.log('\n📋 Available therapies:');
    therapies.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.fullName} - $${t.price} (${t.duration}min)`);
    });
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedTherapies();
