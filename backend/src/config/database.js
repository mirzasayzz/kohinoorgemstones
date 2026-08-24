import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
    
    // Drop the old username unique index from customers collection if it exists
    try {
      const customersCollection = db.collection('customers');
      const indexes = await customersCollection.listIndexes().toArray();
      const usernameIndex = indexes.find(index => index.key && index.key.username);
      
      if (usernameIndex) {
        await customersCollection.dropIndex(usernameIndex.name);
        console.log('Dropped username unique index from customers collection');
      }
    } catch (error) {
      // Collection may not exist or index already dropped
      console.log('Username index not found or already removed');
    }
    
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