import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BusinessInfo from '../models/BusinessInfo.js';
import Gemstone from '../models/Gemstone.js';
import User from '../models/User.js';

dotenv.config();

// Real Business Data for Kohinoor Gemstones
const businessData = {
  shopName: 'Kohinoor Gemstones',
  tagline: 'Premium Mining, Cutting & Polishing of Natural Gemstones',
  description: 'Kohinoor Gemstones is a trusted name in Stones / Minerals Mining / Cutting / Polishing. We specialize in Neelam, Pukhraj, Ruby and other precious gemstones. Based in Bareilly, Uttar Pradesh, we bring you authentic, certified natural gemstones with exceptional quality and craftsmanship.',
  
  // Contact Information
  contact: {
    phone: '+91 8046073114',
    alternatePhone: '',
    email: 'kohinoorgemstones@gmail.com',
    whatsapp: '+91 8046073114'
  },
  
  // Address
  address: {
    street: 'Shahbad, Deewan Khana',
    landmark: 'Opposite Dr. Deewedi',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    pincode: '225416',
    country: 'India',
    coordinates: {
      latitude: 30.15571100,
      longitude: 76.86972300
    },
    googleMapsUrl: 'https://www.google.co.in/maps/dir//30.15571100,76.86972300'
  },
  
  // Business Hours
  businessHours: {
    monday: { open: '10:00', close: '20:00', closed: false },
    tuesday: { open: '10:00', close: '20:00', closed: false },
    wednesday: { open: '10:00', close: '20:00', closed: false },
    thursday: { open: '10:00', close: '20:00', closed: false },
    friday: { open: '10:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '20:00', closed: false },
    sunday: { open: '11:00', close: '18:00', closed: false }
  },
  
  // Social Media
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: ''
  },
  
  // Heritage Story
  heritage: {
    title: 'Our Legacy',
    story: 'Kohinoor Gemstones has been a trusted name in the gemstone industry, specializing in mining, cutting, and polishing of precious stones. Our expertise in Neelam (Blue Sapphire), Pukhraj (Yellow Sapphire), Ruby, and other gemstones has made us a preferred choice for customers seeking authentic, high-quality natural gemstones. Based in the heart of Bareilly, Uttar Pradesh, we continue our tradition of excellence.',
    foundedYear: 2010,
    founderName: 'Mirza Ahad'
  },
  
  // Owner Info
  ownerName: 'Mirza Ahad',
  
  // Policies
  policies: {
    returnPolicy: 'We offer a 7-day return policy on all gemstones with original certification. Gemstones must be in original condition with no damage or alterations.',
    shippingPolicy: 'Free shipping on orders above ₹5,000. Standard delivery within 3-5 business days across India. Express delivery available at additional cost.',
    privacyPolicy: 'Your personal information is protected and never shared with third parties. We use secure payment gateways for all transactions.',
    termsOfService: 'All gemstones are natural and certified. Prices are subject to change based on market conditions. Custom cutting and polishing services available on request.'
  },
  
  // Certifications
  certifications: [
    {
      name: 'GIA Certified',
      description: 'Gemological Institute of America certification',
      isActive: true
    },
    {
      name: 'Natural Gemstone Guarantee',
      description: '100% natural gemstones with authenticity certificate',
      isActive: true
    }
  ],
  
  // Theme
  theme: {
    primaryColor: '#D4AF37',
    secondaryColor: '#1a1a2e',
    accentColor: '#f5f5dc'
  },
  
  // SEO
  seo: {
    metaTitle: 'Kohinoor Gemstones - Premium Neelam, Pukhraj & Ruby in Bareilly',
    metaDescription: 'Buy authentic certified Neelam, Pukhraj, Ruby and other precious gemstones from Kohinoor Gemstones, Bareilly. Mining, cutting & polishing experts since 2010.',
    keywords: ['neelam', 'pukhraj', 'ruby', 'gemstones', 'bareilly', 'natural gemstones', 'certified gemstones', 'blue sapphire', 'yellow sapphire']
  }
};

// Real Gemstones Data - Following the exact Gemstone model schema
// purpose enum: ['Love', 'Health', 'Wealth', 'Protection', 'Spiritual Growth', 'Success', 'Peace', 'Wisdom']
// weight.unit enum: ['carats', 'grams', 'ratti']
const gemstonesData = [
  {
    name: {
      english: 'Neelam (Blue Sapphire)',
      urdu: 'نیلم'
    },
    category: 'Sapphire',
    color: 'Royal Blue',
    weight: {
      value: 1,
      unit: 'carats'
    },
    priceRange: {
      min: 1000,
      max: 50000,
      currency: 'INR'
    },
    summary: 'Premium Neelam (Blue Sapphire) - Stone of Saturn for wisdom and protection.',
    description: 'Neelam or Blue Sapphire is one of the most powerful gemstones in Vedic astrology. Associated with Lord Saturn (Shani), it brings wisdom, discipline, career success, and protection from negative energies. Our Neelam stones are sourced from the finest mines and professionally cut and polished at our Bareilly facility. Starting from ₹1,000 per carat.',
    origin: 'Kashmir/Ceylon',
    astrologyBenefits: 'Brings career growth, mental clarity, protection from enemies, wealth accumulation. Ideal for Capricorn and Aquarius. Associated with Saturn (Shani) and Third Eye chakra.',
    uses: 'Wear on middle finger on Saturday. Best for professionals, students, and those seeking protection.',
    purpose: ['Protection', 'Wisdom', 'Success', 'Wealth'],
    tags: ['neelam', 'blue sapphire', 'saturn', 'shani', 'career', 'protection'],
    trending: true,
    featured: true,
    isActive: true,
    availability: 'In Stock'
  },
  {
    name: {
      english: 'Pukhraj (Yellow Sapphire)',
      urdu: 'پکھراج'
    },
    category: 'Sapphire',
    color: 'Golden Yellow',
    weight: {
      value: 1,
      unit: 'carats'
    },
    priceRange: {
      min: 2000,
      max: 75000,
      currency: 'INR'
    },
    summary: 'Natural Pukhraj - Gemstone of Jupiter for prosperity and wisdom.',
    description: 'Pukhraj or Yellow Sapphire is the gemstone of planet Jupiter (Brihaspati/Guru). It is highly valued in Vedic astrology for bringing prosperity, wisdom, good health, and marital bliss. Our Pukhraj stones are carefully selected and processed at our Bareilly facility to ensure the highest quality.',
    origin: 'Ceylon/Bangkok',
    astrologyBenefits: 'Brings prosperity, academic success, marital happiness, good health, spiritual growth. Ideal for Sagittarius and Pisces. Associated with Jupiter (Brihaspati).',
    uses: 'Wear on index finger on Thursday. Best for students, teachers, judges, and those seeking marriage.',
    purpose: ['Wealth', 'Wisdom', 'Health', 'Spiritual Growth'],
    tags: ['pukhraj', 'yellow sapphire', 'jupiter', 'guru', 'prosperity', 'marriage'],
    trending: true,
    featured: true,
    isActive: true,
    availability: 'In Stock'
  },
  {
    name: {
      english: 'Ruby (Manik)',
      urdu: 'مانک / یاقوت'
    },
    category: 'Ruby',
    color: 'Pigeon Blood Red',
    weight: {
      value: 1,
      unit: 'carats'
    },
    priceRange: {
      min: 5000,
      max: 200000,
      currency: 'INR'
    },
    summary: 'Premium Ruby (Manik) - The King of Gemstones for power and success.',
    description: 'Ruby or Manik is known as the "King of Gemstones" and represents the Sun (Surya) in Vedic astrology. It brings power, authority, passion, and success. Our Ruby stones feature the highly sought-after pigeon blood red color and are expertly cut and polished at our facility.',
    origin: 'Myanmar/Mozambique',
    astrologyBenefits: 'Enhances leadership qualities, fame, recognition, confidence, courage, and heart health. Ideal for Leo. Associated with Sun (Surya) and Heart chakra.',
    uses: 'Wear on ring finger on Sunday. Best for leaders, politicians, and those in authority.',
    purpose: ['Success', 'Health', 'Protection', 'Wealth'],
    tags: ['ruby', 'manik', 'sun', 'surya', 'power', 'leadership', 'leo'],
    trending: true,
    featured: true,
    isActive: true,
    availability: 'In Stock'
  },
  {
    name: {
      english: 'Pearl (Moti)',
      urdu: 'موتی'
    },
    category: 'Pearl',
    color: 'Creamy White',
    weight: {
      value: 5,
      unit: 'carats'
    },
    priceRange: {
      min: 500,
      max: 25000,
      currency: 'INR'
    },
    summary: 'Natural Pearl Beads (Moti) - Gemstone of Moon for peace and beauty.',
    description: 'Pearl or Moti represents the Moon (Chandra) in Vedic astrology. It brings peace of mind, emotional stability, beauty, and good relationships. Our pearl collection includes high-quality natural and cultured pearls perfect for jewelry and astrological purposes.',
    origin: 'South Sea/Freshwater',
    astrologyBenefits: 'Brings peace of mind, emotional balance, beauty enhancement, good sleep, mother-child bonding. Ideal for Cancer. Associated with Moon (Chandra).',
    uses: 'Wear on little finger on Monday. Best for emotional balance and relationships.',
    purpose: ['Peace', 'Love', 'Health', 'Spiritual Growth'],
    tags: ['pearl', 'moti', 'moon', 'chandra', 'peace', 'beauty', 'cancer'],
    trending: false,
    featured: true,
    isActive: true,
    availability: 'In Stock'
  },
  {
    name: {
      english: 'Opal Stone',
      urdu: 'اوپل'
    },
    category: 'Opal',
    color: 'Multi-color Play',
    weight: {
      value: 1,
      unit: 'carats'
    },
    priceRange: {
      min: 1500,
      max: 50000,
      currency: 'INR'
    },
    summary: 'Natural Opal - Magical gemstone with play of colors for creativity.',
    description: 'Opal is known for its beautiful play of colors and is associated with Venus (Shukra). It enhances creativity, love, passion, and artistic abilities. Our Opal stones display excellent fire and color play, carefully selected for quality.',
    origin: 'Australia/Ethiopia',
    astrologyBenefits: 'Enhances creativity, love, passion, artistic abilities, confidence. Ideal for Libra and Taurus. Associated with Venus (Shukra).',
    uses: 'Wear on ring finger on Friday. Best for artists, designers, and those seeking love.',
    purpose: ['Love', 'Success', 'Wealth', 'Peace'],
    tags: ['opal', 'venus', 'shukra', 'creativity', 'love', 'art'],
    trending: true,
    featured: false,
    isActive: true,
    availability: 'In Stock'
  },
  {
    name: {
      english: 'Emerald (Panna)',
      urdu: 'پنا / زمرد'
    },
    category: 'Emerald',
    color: 'Vivid Green',
    weight: {
      value: 1,
      unit: 'carats'
    },
    priceRange: {
      min: 3000,
      max: 150000,
      currency: 'INR'
    },
    summary: 'Natural Emerald (Panna) - Gemstone of Mercury for intelligence.',
    description: 'Emerald or Panna represents Mercury (Budh) in Vedic astrology. It enhances intelligence, communication skills, memory, and business acumen. Our Emeralds feature the prized vivid green color with excellent transparency.',
    origin: 'Colombia/Zambia',
    astrologyBenefits: 'Enhances intelligence, business success, communication skills, memory improvement. Ideal for Gemini and Virgo. Associated with Mercury (Budh).',
    uses: 'Wear on little finger on Wednesday. Best for businessmen, writers, and students.',
    purpose: ['Wisdom', 'Success', 'Wealth', 'Health'],
    tags: ['emerald', 'panna', 'mercury', 'budh', 'intelligence', 'business'],
    trending: true,
    featured: true,
    isActive: true,
    availability: 'In Stock'
  }
];

async function seedRealData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user for addedBy field
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin first.');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.email}`);

    // Update or create Business Info
    console.log('\n📊 Updating Business Information...');
    const existingBusiness = await BusinessInfo.findOne({});
    if (existingBusiness) {
      await BusinessInfo.findByIdAndUpdate(existingBusiness._id, businessData);
      console.log('✅ Business info updated');
    } else {
      await BusinessInfo.create(businessData);
      console.log('✅ Business info created');
    }

    // Seed Gemstones
    console.log('\n💎 Seeding Gemstones...');
    for (const gemstone of gemstonesData) {
      // Generate slug from name
      const slug = gemstone.name.english
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      
      const existing = await Gemstone.findOne({ slug: slug });
      if (existing) {
        await Gemstone.findByIdAndUpdate(existing._id, {
          ...gemstone
        });
        console.log(`   ✅ Updated: ${gemstone.name.english}`);
      } else {
        await Gemstone.create({
          ...gemstone,
          addedBy: adminUser._id
        });
        console.log(`   ✅ Created: ${gemstone.name.english}`);
      }
    }

    console.log('\n🎉 Real data seeded successfully!');
    console.log('='.repeat(50));
    console.log('📍 Business: Kohinoor Gemstones, Bareilly');
    console.log('👤 Owner: Mirza Ahad');
    console.log('📞 Contact: 8046073114');
    console.log(`💎 Gemstones: ${gemstonesData.length} products added`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedRealData();
