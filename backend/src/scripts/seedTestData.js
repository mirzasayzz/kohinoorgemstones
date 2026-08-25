import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Gemstone from '../models/Gemstone.js';
import Category from '../models/Category.js';

dotenv.config();

const SEED_GEMSTONES = [
  {
    name: { english: 'Royal Ruby', urdu: 'Yaqoot Sultani' },
    category: 'Ruby',
    color: 'Deep Crimson Red',
    summary: 'A magnificent royal ruby known for its passionate energy and protective qualities.',
    description: 'This exquisite Royal Ruby displays the finest crimson red color that has captivated hearts for centuries. Known as the "King of Gemstones," it embodies passion, protection, and prosperity.',
    purpose: ['Love', 'Protection', 'Success', 'Wisdom'],
    price: 50000,
    isTrending: true
  },
  {
    name: { english: 'Emerald of Tranquility', urdu: 'Zamurrad Sakoon' },
    category: 'Emerald',
    color: 'Vivid Forest Green',
    summary: 'A serene emerald that brings peace, wisdom, and spiritual growth.',
    description: 'This stunning Emerald of Tranquility showcases the most sought-after vivid green color that symbolizes rebirth, love, and wisdom. Revered by ancient civilizations as a stone of prophecy.',
    purpose: ['Health', 'Spiritual Growth', 'Peace', 'Wisdom'],
    price: 45000,
    isTrending: true
  },
  {
    name: { english: 'Celestial Sapphire', urdu: 'Neelam Aasmani' },
    category: 'Sapphire',
    color: 'Royal Blue',
    summary: 'A divine sapphire that channels celestial wisdom, mental clarity, and spiritual protection.',
    description: 'The Celestial Sapphire radiates with the deep, velvety blue of a starlit sky, embodying divine wisdom and celestial protection.',
    purpose: ['Wisdom', 'Protection', 'Spiritual Growth', 'Success'],
    price: 60000,
    isTrending: false
  },
  {
    name: { english: 'Pukhraj Yellow Sapphire', urdu: 'Pukhraj' },
    category: 'Topaz',
    color: 'Golden Yellow',
    summary: 'A radiant yellow sapphire associated with prosperity, wisdom, and good fortune.',
    description: 'This bright Pukhraj radiates warmth and is traditionally worn to attract prosperity and improve focus and wisdom.',
    purpose: ['Wealth', 'Wisdom', 'Success'],
    price: 40000,
    isTrending: false
  },
  {
    name: { english: 'Red Coral Moonga', urdu: 'Moonga' },
    category: 'Coral',
    color: 'Vibrant Red',
    summary: 'A protective coral known to boost courage, vitality, and confidence.',
    description: 'This vibrant red Moonga is prized for its grounding energy, courage, and protective qualities in the Mars-ruled tradition.',
    purpose: ['Protection', 'Success'],
    price: 30000,
    isTrending: false
  }
];

async function seedTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kohinoor.test';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    let admin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'Test Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin'
      });
      console.log('✅ Admin created:', admin.email);
    } else {
      console.log('✅ Admin already exists:', admin.email);
      if (admin.email !== adminEmail) {
        admin.email = adminEmail;
        admin.password = adminPassword;
        await admin.save();
        console.log('✅ Admin credentials ensured');
      }
    }

    // Seed default categories
    try {
      await Category.seedDefaultCategories(admin._id);
    } catch (e) {
      console.log('⚠️ Categories seed skipped:', e.message);
    }

    // Seed gemstones idempotently (upsert by slug, do not wipe)
    for (const data of SEED_GEMSTONES) {
      const gemstone = await Gemstone.findOneAndUpdate(
        { slug: data.name.english.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
        { ...data, addedBy: admin._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ Gemstone ensured: ${gemstone.name.english}`);
    }

    // Ensure verified customer
    const customerEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const customerPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    let customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      customer = await Customer.create({
        name: process.env.TEST_USER_NAME || 'QA Tester',
        email: customerEmail,
        password: customerPassword,
        phone: '9876543210',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Customer created:', customer.email);
    } else {
      customer.isEmailVerified = true;
      customer.isActive = true;
      customer.password = customerPassword;
      await customer.save();
      console.log('✅ Customer verified:', customer.email);
    }

    // Ensure unverified customer for email-verification tests (OTP pinned to 123456 in TEST_MODE)
    const unverifiedEmail = process.env.UNVERIFIED_USER_EMAIL || 'unverified@kohinoor.test';
    let unverified = await Customer.findOne({ email: unverifiedEmail });
    const otpHashed = crypto.createHash('sha256').update('123456').digest('hex');
    if (!unverified) {
      unverified = await Customer.create({
        name: 'Unverified Tester',
        email: unverifiedEmail,
        password: 'TestPassword123!',
        phone: '9123456780',
        isEmailVerified: false,
        isActive: true,
        emailVerificationOTP: otpHashed,
        emailVerificationExpire: Date.now() + 3600 * 1000
      });
      console.log('✅ Unverified customer created:', unverified.email);
    } else {
      unverified.isEmailVerified = false;
      unverified.emailVerificationOTP = otpHashed;
      unverified.emailVerificationExpire = Date.now() + 3600 * 1000;
      await unverified.save();
      console.log('✅ Unverified customer refreshed:', unverified.email);
    }

    console.log('🎉 Test data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test data seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestData();