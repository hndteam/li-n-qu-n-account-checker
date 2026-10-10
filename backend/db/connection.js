import 'dotenv/config';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

let db = null;

export async function initDB() {
  const dbType = process.env.DB_TYPE || 'mongo';

  if (dbType === 'mongo') {
    return await initMongo();
  } else if (dbType === 'postgres') {
    return await initPostgres();
  } else {
    throw new Error(`Unsupported DB_TYPE: ${dbType}`);
  }
}

async function initMongo() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/lien-quan-checker';
    await mongoose.connect(uri);
    db = mongoose;
    console.log('✓ MongoDB connected');
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

async function initPostgres() {
  try {
    const sequelize = new Sequelize(process.env.POSTGRES_URL || 'postgresql://user:password@localhost:5432/lien-quan_checker', {
      logging: false
    });
    await sequelize.authenticate();
    db = sequelize;
    console.log('✓ PostgreSQL connected');
    return db;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    throw error;
  }
}

export function getDB() {
  return db;
}
