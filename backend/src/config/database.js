import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kohinoor-gemstone');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Create indexes for gemstones collection
    await db.collection('gemstones').createIndex({ name: 'text', description: 'text' });
    await db.collection('gemstones').createIndex({ category: 1 });
    await db.collection('gemstones').createIndex({ purpose: 1 });
    await db.collection('gemstones').createIndex({ trending: 1 });
    await db.collection('gemstones').createIndex({ createdAt: -1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.log('Error creating indexes:', error.message);
  }
};

export default connectDB; 