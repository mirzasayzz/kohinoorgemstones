import mongoose from 'mongoose';
import Gemstone from '../models/Gemstone.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Beautiful seed gemstones data
const SEED_GEMSTONES = [
  {
    name: {
      english: 'Royal Ruby',
      urdu: 'Yaqoot Sultani'
    },
    category: 'Ruby',
    color: 'Deep Crimson Red',
    summary: 'A magnificent royal ruby known for its passionate energy and protective qualities, perfect for love and leadership.',
    description: 'This exquisite Royal Ruby displays the finest crimson red color that has captivated hearts for centuries. Known as the "King of Gemstones," this ruby embodies passion, protection, and prosperity. Sourced from the legendary mines of Myanmar, it carries the ancient wisdom of royalty and the power to enhance confidence, courage, and charisma. Its brilliant clarity and exceptional fire make it a treasure for both jewelry connoisseurs and spiritual seekers. The ruby\'s energy resonates with the heart chakra, promoting love, vitality, and emotional healing.',
    purpose: ['Love', 'Protection', 'Success', 'Wisdom'],
    images: [],
    isTrending: true
  },
  {
    name: {
      english: 'Emerald of Tranquility', 
      urdu: 'Zamurrad Sakoon'
    },
    category: 'Emerald',
    color: 'Vivid Forest Green',
    summary: 'A serene emerald that brings peace, wisdom, and spiritual growth, known for its calming energy and healing properties.',
    description: 'This stunning Emerald of Tranquility showcases the most sought-after vivid green color that symbolizes rebirth, love, and wisdom. Revered by ancient civilizations as a stone of prophecy and infinite patience, this emerald connects the bearer to nature\'s abundant energy. Its mesmerizing green hues promote emotional healing, enhance intuition, and bring clarity to complex situations. This precious gemstone is believed to strengthen relationships, attract prosperity, and provide protection during travel. The emerald\'s gentle yet powerful energy makes it perfect for meditation and spiritual practices.',
    purpose: ['Health', 'Spiritual Growth', 'Peace', 'Wisdom'],
    images: [],
    isTrending: true
  },
  {
    name: {
      english: 'Celestial Sapphire',
      urdu: 'Neelam Aasmani'
    },
    category: 'Sapphire',
    color: 'Royal Blue',
    summary: 'A divine sapphire that channels celestial wisdom, mental clarity, and spiritual protection from the heavens above.',
    description: 'The Celestial Sapphire radiates with the deep, velvety blue of a starlit sky, embodying divine wisdom and celestial protection. This exceptional gemstone has been treasured by royalty and spiritual leaders throughout history for its ability to enhance mental clarity, focus, and spiritual insight. Known as the "Stone of Heaven," it promotes loyalty, integrity, and noble thoughts while providing protection against negative energies. Its remarkable color and brilliance make it a symbol of truth and sincerity. This sapphire is particularly powerful for those seeking spiritual enlightenment, academic success, and inner peace.',
    purpose: ['Wisdom', 'Protection', 'Spiritual Growth', 'Success'],
    images: [],
    isTrending: false
  }
];

async function clearAndSeedGemstones() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user for addedBy field
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    console.log('👤 Found admin user:', adminUser.email);
    
    // Clear existing gemstones
    console.log('🗑️ Clearing existing gemstones...');
    const deleteResult = await Gemstone.deleteMany({});
    console.log(`✅ Removed ${deleteResult.deletedCount} existing gemstones`);
    
    // Seed new gemstones
    console.log('🌱 Seeding new gemstones...');
    const seedPromises = SEED_GEMSTONES.map(gemstoneData => {
      const gemstone = new Gemstone({
        ...gemstoneData,
        addedBy: adminUser._id,
        slug: gemstoneData.name.english.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      });
      return gemstone.save();
    });
    
    const createdGemstones = await Promise.all(seedPromises);
    console.log(`✅ Successfully created ${createdGemstones.length} gemstones:`);
    
    createdGemstones.forEach((gemstone, index) => {
      console.log(`   ${index + 1}. ${gemstone.name.english} (${gemstone.name.urdu})`);
      console.log(`      Category: ${gemstone.category} | Trending: ${gemstone.isTrending ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🔗 Visit: http://localhost:3001/admin/gemstones to view the beautiful new gemstones');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding function
clearAndSeedGemstones(); 