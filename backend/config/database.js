/**
 * database.js - MongoDB Atlas connection via Mongoose
 * Provides a compatibility layer matching the old in-memory DB API
 * so all controllers work without modification.
 */

import mongoose from 'mongoose';

// ─── Generic Schema ───────────────────────────────────────────────────────────
// We use a flexible schema (strict: false) per collection so we don't need
// individual model files for every collection.
const modelCache = {};

const getModel = (collection) => {
  if (modelCache[collection]) return modelCache[collection];

  const schema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true, collection }
);

  modelCache[collection] = mongoose.model(collection, schema);
  return modelCache[collection];
};

// ─── Connect ──────────────────────────────────────────────────────────────────
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ─── Helper: build a Mongoose filter from a plain query object ────────────────
const buildFilter = (query = {}) => {
  const filter = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (key === 'id') {
      // Try to cast to ObjectId; fall back to string for string _ids
      try {
        filter._id = mongoose.Types.ObjectId.isValid(value)
          ? new mongoose.Types.ObjectId(value)
          : value;
      } catch {
        filter._id = value;
      }
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      filter[key] = value;
    } else {
      filter[key] = value;
    }
  }
  return filter;
};

// ─── Helper: normalise a Mongoose doc to a plain object with `id` ─────────────
const toPlain = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : { ...doc };
  obj.id = String(obj._id);
  delete obj._id;
  return obj;
};

// ─── CRUD API (mirrors old in-memory DB exports) ──────────────────────────────

export const findOne = (collection, query = {}) => {
  const filter = buildFilter(query);
  console.log('🔍 findOne filter:', JSON.stringify(filter)); // ← ADD
  
  return getModel(collection)
    .findOne(filter)
    .lean()
    .then((doc) => {
      console.log('📄 findOne result:', doc ? 'FOUND' : 'NOT FOUND'); // ← ADD
      if (!doc) return null;
      const obj = { ...doc };
      obj.id = String(obj._id);
      delete obj._id;
      return obj;
    });
};
export const findMany = (collection, query = {}, options = {}) => {
  let q = getModel(collection).find(buildFilter(query));

  if (options.sortBy) {
    q = q.sort({ [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 });
  }
  if (options.limit) {
    q = q.skip(options.offset || 0).limit(options.limit);
  }

  return q.lean().then((docs) =>
    docs.map((doc) => {
      const obj = { ...doc };
      obj.id = String(obj._id);
      delete obj._id;
      return obj;
    })
  );
};

export const insertOne = async (collection, data) => {
  const Model = getModel(collection);
  const id = data.id
    ? (mongoose.Types.ObjectId.isValid(data.id) ? new mongoose.Types.ObjectId(data.id) : data.id)
    : new mongoose.Types.ObjectId();
  const { id: _ignored, ...rest } = data;
  const doc = new Model({ _id: id, ...rest });
  const saved = await doc.save();
  return toPlain(saved);
};

export const updateOne = async (collection, query, update) => {
  const filter = buildFilter(query);
  const doc = await getModel(collection).findOneAndUpdate(
    filter,
    { $set: { ...update, updatedAt: new Date() } },
    { new: true, upsert: false }
  );
  return toPlain(doc);
};

export const deleteOne = async (collection, query) => {
  const result = await getModel(collection).deleteOne(buildFilter(query));
  return result.deletedCount > 0;
};

export const count = (collection, query = {}) => {
  return getModel(collection).countDocuments(buildFilter(query));
};

export const aggregate = (collection, pipeline) => {
  return getModel(collection).aggregate(pipeline);
};

// ─── Aliases used across controllers ─────────────────────────────────────────
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
  findByCondition,
};
