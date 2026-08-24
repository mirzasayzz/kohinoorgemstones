import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BusinessInfo from '../models/BusinessInfo.js';

dotenv.config();

// Real Kohinoor Gemstones Business Data
const businessData = {
  shopName: 'Kohinoor Gemstones',
  tagline: 'Premium Mining, Cutting & Polishing of Natural Gemstones',
  description: 'Kohinoor Gemstones specializes in Stones/Minerals Mining, Cutting & Polishing. We offer Neelam, Pukhraj, Ruby and other precious gemstones. Based in Bareilly, Uttar Pradesh.',
  
  contact: {
    phone: '+918046073114',
    whatsapp: '+918046073114',
    email: 'kohinoorgemstones@gmail.com'
  },
  
  address: {
    street: 'Shahbad, Deewan Khana',
    area: 'Opposite Dr. Deewedi',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    pincode: '225416',
    country: 'India',
    fullAddress: 'Shahbad, Deewan Khana, Opposite Dr. Deewedi, Bareilly-225416, Uttar Pradesh, India'
  },
  
  // Google Maps URL with coordinates
  googleMapsUrl: 'https://www.google.com/maps?q=30.15571100,76.86972300',
  
  businessHours: {
    monday: { open: '10:00', close: '20:00', closed: false },
    tuesday: { open: '10:00', close: '20:00', closed: false },
    wednesday: { open: '10:00', close: '20:00', closed: false },
    thursday: { open: '10:00', close: '20:00', closed: false },
    friday: { open: '10:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '20:00', closed: false },
    sunday: { open: '11:00', close: '18:00', closed: false }
  },
  
  heritage: {
    foundedYear: 2010,
    story: 'Kohinoor Gemstones has been a trusted name in the gemstone industry, specializing in mining, cutting, and polishing of precious stones. Our expertise in Neelam, Pukhraj, Ruby, and other gemstones has made us a preferred choice for customers seeking authentic, high-quality natural gemstones.',
    founderName: 'Mirza Ahad',
    generation: 1
  },
  
  ownerName: 'Mirza Ahad'
};

async function updateBusinessInfo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find existing or create new
    let business = await BusinessInfo.findOne({});
    
    if (business) {
      // Update existing
      Object.assign(business, businessData);
      await business.save();
      console.log('✅ Business info updated');
    } else {
      // Create new
      business = await BusinessInfo.create(businessData);
      console.log('✅ Business info created');
    }

    console.log('\n📍 Business Details:');
    console.log(`   Name: ${business.shopName}`);
    console.log(`   Owner: ${business.ownerName}`);
    console.log(`   Phone: ${business.contact?.phone}`);
    console.log(`   Address: ${business.address?.fullAddress}`);
    console.log(`   Maps: ${business.googleMapsUrl}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateBusinessInfo();
