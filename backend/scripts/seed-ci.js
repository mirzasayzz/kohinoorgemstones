import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Gemstone from '../src/models/Gemstone.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kohinoor_playwright';

try {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({ email: 'admin@playwright.local' }),
    Customer.deleteMany({ email: 'customer@playwright.local' }),
    Gemstone.deleteMany({ slug: { $in: ['playwright-emerald', 'playwright-ruby'] } }),
  ]);

  console.log('Cleaned old data');

  const admin = await User.create({
    name: 'Playwright Admin',
    email: 'admin@playwright.local',
    password: 'PlaywrightPassword123',
    role: 'super_admin',
  });

  console.log('Admin created');

  await Customer.create({
    name: 'Playwright Customer',
    email: 'customer@playwright.local',
    password: 'PlaywrightPassword123',
    phone: '9876543210',
    isEmailVerified: true,
  });

  console.log('Customer created');

  // Use create instead of insertMany to trigger pre-save hooks (slug generation)
  await Gemstone.create({
    name: { english: 'Playwright Emerald', urdu: 'زمرد' },
    category: 'Emerald',
    color: 'Green',
    summary: 'A deterministic emerald used by the browser test suite.',
    description: 'This seeded emerald provides a stable catalog and detail-page contract for automated tests.',
    purpose: ['Wisdom', 'Success'],
    images: [{ url: 'https://placehold.co/600x600/png?text=Emerald', publicId: 'playwright-emerald', alt: 'Playwright Emerald' }],
    price: 25000,
    trending: true,
    featured: true,
    addedBy: admin._id,
  });

  await Gemstone.create({
    name: { english: 'Playwright Ruby', urdu: 'یاقوت' },
    category: 'Ruby',
    color: 'Red',
    summary: 'A deterministic ruby used by the browser test suite.',
    description: 'This seeded ruby verifies filtering and related-catalog behavior without remote dependencies.',
    purpose: ['Love', 'Protection'],
    images: [{ url: 'https://placehold.co/600x600/png?text=Ruby', publicId: 'playwright-ruby', alt: 'Playwright Ruby' }],
    price: 18000,
    addedBy: admin._id,
  });

  console.log('Gemstones seeded');
  console.log('Seed completed successfully');
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
