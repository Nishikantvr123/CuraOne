import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// In-memory database for demo purposes
// In production, this would be replaced with PostgreSQL connection
let db = {
  users: [],
  therapies: [],
  sessions: [],
  bookings: [],
  wellness_checkins: [],
  feedback: [],
  notifications: [],
  practitioners: [],
  // New CuraOne collections
  chats: [],
  prescriptions: [],
  payments: [],
  inventory: [],
  doshaProfiles: [],
  auditLogs: []
};

const DB_FILE = './data/database.json';

// Load data from file if it exists
const loadDatabase = async () => {
  try {
    if (existsSync(DB_FILE)) {
      const data = await readFile(DB_FILE, 'utf8');
      db = JSON.parse(data);
      console.log('📊 Database loaded from file');
    } else {
      // Initialize with sample data
      await initializeSampleData();
      console.log('📊 Database initialized with sample data');
    }
  } catch (error) {
    console.error('❌ Error loading database:', error.message);
    await initializeSampleData();
  }
};

// Save data to file
const saveDatabase = async () => {
  try {
    // Create data directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir('./data', { recursive: true });
    } catch (err) {
      // Directory already exists
    }
    
    await writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
  }
};

// Initialize sample data
const initializeSampleData = async () => {
  // Sample users
  db.users = [
    {
      id: uuidv4(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@curaone.com',
      password: '$2a$10$Kh2Q8sOZTiLKMXWVzmYUH.Yokw99cAm9yxthFW58TYriHqHwEXA2W', // password123
      role: 'patient',
      phone: '+1-555-0123',
      dateOfBirth: '1985-06-15',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=059669&color=fff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: uuidv4(),
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      email: 'practitioner@curaone.com',
      password: '$2a$10$Kh2Q8sOZTiLKMXWVzmYUH.Yokw99cAm9yxthFW58TYriHqHwEXA2W', // password123
      role: 'practitioner',
      phone: '+1-555-0124',
      specialization: ['Panchakarma', 'Ayurvedic Massage', 'Herbal Medicine'],
      experience: 8,
      qualifications: ['BAMS', 'MD (Panchakarma)', 'Certified Ayurvedic Practitioner'],
      licenseNumber: 'AYU-2016-001',
      avatar: 'https://ui-avatars.com/api/?name=Dr+Sarah+Smith&background=0284c7&color=fff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@curaone.com',
      password: '$2a$10$Kh2Q8sOZTiLKMXWVzmYUH.Yokw99cAm9yxthFW58TYriHqHwEXA2W', // password123
      role: 'admin',
      phone: '+1-555-0125',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  ];

  // Sample therapies
  db.therapies = [
    {
      id: uuidv4(),
      name: 'Abhyanga',
      fullName: 'Abhyanga (Full Body Oil Massage)',
      description: 'Traditional Ayurvedic full body oil massage that promotes relaxation and detoxification.',
      duration: 60,
      defaultDuration: 60,
      category: 'detox',
      price: 120,
      benefits: ['Deep relaxation', 'Improved circulation', 'Detoxification', 'Stress relief'],
      precautions: ['Not suitable during fever', 'Avoid during menstruation'],
      contraindications: ['Acute illness', 'Skin infections'],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Shirodhara',
      fullName: 'Shirodhara (Oil Pouring Therapy)',
      description: 'Continuous pouring of warm oil over the forehead to calm the mind and nervous system.',
      duration: 45,
      defaultDuration: 45,
      category: 'rejuvenation',
      price: 150,
      benefits: ['Mental calmness', 'Stress relief', 'Better sleep', 'Hair health'],
      precautions: ['Avoid sudden movements', 'Keep eyes closed'],
      contraindications: ['Head injuries', 'Severe depression'],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Panchakarma',
      fullName: 'Panchakarma (Complete Detox Program)',
      description: 'Comprehensive five-step detoxification and rejuvenation program.',
      duration: 90,
      defaultDuration: 90,
      category: 'healing',
      price: 300,
      benefits: ['Complete detox', 'Rejuvenation', 'Immune boost', 'Mental clarity'],
      precautions: ['Requires consultation', 'Follow dietary guidelines'],
      contraindications: ['Pregnancy', 'Severe heart conditions'],
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Sample inventory items
  db.inventory = [
    {
      id: uuidv4(),
      name: 'Sesame Massage Oil',
      category: 'Oils',
      sku: 'OIL-001',
      quantity: 45,
      unit: 'liters',
      minStock: 10,
      price: 25.00,
      supplier: 'Ayur Organics',
      description: 'Pure cold-pressed sesame oil for Abhyanga massage',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Triphala Churna',
      category: 'Herbs',
      sku: 'HERB-001',
      quantity: 25,
      unit: 'kg',
      minStock: 5,
      price: 35.00,
      supplier: 'Himalayan Herbs Co.',
      description: 'Organic Triphala powder for digestive health',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Brahmi Oil',
      category: 'Oils',
      sku: 'OIL-002',
      quantity: 8,
      unit: 'liters',
      minStock: 10,
      price: 40.00,
      supplier: 'Ayur Organics',
      description: 'Brahmi-infused oil for Shirodhara therapy',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Cotton Therapy Sheets',
      category: 'Supplies',
      sku: 'SUP-001',
      quantity: 100,
      unit: 'pieces',
      minStock: 20,
      price: 8.00,
      supplier: 'Wellness Supplies Inc.',
      description: 'Disposable cotton sheets for therapy tables',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Ashwagandha Capsules',
      category: 'Supplements',
      sku: 'SUPP-001',
      quantity: 3,
      unit: 'bottles',
      minStock: 10,
      price: 28.00,
      supplier: 'Himalayan Herbs Co.',
      description: 'Organic Ashwagandha for stress relief',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Herbal Steam Mixture',
      category: 'Herbs',
      sku: 'HERB-002',
      quantity: 15,
      unit: 'kg',
      minStock: 5,
      price: 45.00,
      supplier: 'Ayur Organics',
      description: 'Blend of herbs for Swedana steam therapy',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Initialize empty collections for other features
  db.prescriptions = db.prescriptions || [];
  db.payments = db.payments || [];
  db.doshaResults = db.doshaResults || [];
  db.auditLogs = db.auditLogs || [];
  db.chats = db.chats || [];

  await saveDatabase();
};

// Database operations
export const connectDB = async () => {
  try {
    await loadDatabase();
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Generic CRUD operations
export const findOne = (collection, query) => {
  if (!db[collection]) return null;
  
  return db[collection].find(item => {
    return Object.keys(query).every(key => {
      if (query[key] === undefined) return true;
      return item[key] === query[key];
    });
  }) || null;
};

export const findMany = (collection, query = {}, options = {}) => {
  if (!db[collection]) return [];
  
  let results = db[collection].filter(item => {
    return Object.keys(query).every(key => {
      if (query[key] === undefined) return true;
      return item[key] === query[key];
    });
  });

  // Apply sorting
  if (options.sortBy) {
    results.sort((a, b) => {
      const aVal = a[options.sortBy];
      const bVal = b[options.sortBy];
      if (options.sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  // Apply pagination
  if (options.limit) {
    const offset = options.offset || 0;
    results = results.slice(offset, offset + options.limit);
  }

  return results;
};

export const insertOne = async (collection, data) => {
  if (!db[collection]) db[collection] = [];
  
  const newItem = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db[collection].push(newItem);
  await saveDatabase();
  return newItem;
};

export const updateOne = async (collection, query, update) => {
  if (!db[collection]) return null;
  
  const index = db[collection].findIndex(item => {
    return Object.keys(query).every(key => {
      return item[key] === query[key];
    });
  });
  
  if (index === -1) return null;
  
  db[collection][index] = {
    ...db[collection][index],
    ...update,
    updatedAt: new Date().toISOString()
  };
  
  await saveDatabase();
  return db[collection][index];
};

export const deleteOne = async (collection, query) => {
  if (!db[collection]) return false;
  
  const index = db[collection].findIndex(item => {
    return Object.keys(query).every(key => {
      return item[key] === query[key];
    });
  });
  
  if (index === -1) return false;
  
  db[collection].splice(index, 1);
  await saveDatabase();
  return true;
};

export const count = (collection, query = {}) => {
  if (!db[collection]) return 0;
  
  return db[collection].filter(item => {
    return Object.keys(query).every(key => {
      if (query[key] === undefined) return true;
      return item[key] === query[key];
    });
  }).length;
};

// Aggregate operations for analytics
export const aggregate = (collection, pipeline) => {
  if (!db[collection]) return [];
  
  let results = [...db[collection]];
  
  // Basic aggregation support
  pipeline.forEach(stage => {
    if (stage.$match) {
      results = results.filter(item => {
        return Object.keys(stage.$match).every(key => {
          return item[key] === stage.$match[key];
        });
      });
    }
    
    if (stage.$group) {
      // Basic grouping implementation
      const groups = {};
      results.forEach(item => {
        const key = stage.$group._id;
        const groupKey = typeof key === 'string' ? item[key.replace('$', '')] : 'all';
        
        if (!groups[groupKey]) {
          groups[groupKey] = { _id: groupKey };
        }
        
        Object.keys(stage.$group).forEach(field => {
          if (field !== '_id') {
            const operation = stage.$group[field];
            if (operation.$sum) {
              if (operation.$sum === 1) {
                groups[groupKey][field] = (groups[groupKey][field] || 0) + 1;
              } else {
                const fieldName = operation.$sum.replace('$', '');
                groups[groupKey][field] = (groups[groupKey][field] || 0) + (item[fieldName] || 0);
              }
            }
            if (operation.$avg) {
              // Simplified average calculation
              const fieldName = operation.$avg.replace('$', '');
              groups[groupKey][field] = item[fieldName] || 0;
            }
          }
        });
      });
      
      results = Object.values(groups);
    }
  });
  
  return results;
};

// Alias exports for consistency
export const find = findMany;
export const create = insertOne;
export const update = (collection, id, data) => updateOne(collection, { id }, data);
export const findByCondition = findMany;

export default {
  connectDB,
  findOne,
  findMany,
  find,
  create,
  insertOne,
  update,
  updateOne,
  deleteOne,
  count,
  aggregate,
  findByCondition
};
