import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer.js';

dotenv.config();

async function seedCustomer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'razorpay@example.com';
    const existing = await Customer.findOne({ email });

    if (existing) {
      existing.isEmailVerified = true;
      existing.isActive = true;
      existing.password = 'password123'; // will hash in pre-save
      await existing.save();
      console.log('✅ Pre-verified customer "razorpay@example.com" updated successfully.');
    } else {
      await Customer.create({
        name: 'Razorpay Tester',
        email,
        password: 'password123',
        phone: '9876543210',
        dateOfBirth: new Date('1995-05-15'),
        address: {
          street: 'Test Street 101',
          city: 'Bareilly',
          state: 'Uttar Pradesh',
          pincode: '243001',
          country: 'India'
        },
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Pre-verified customer "razorpay@example.com" created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding customer:', error);
    process.exit(1);
  }
}

seedCustomer();
