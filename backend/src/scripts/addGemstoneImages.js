import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Gemstone from '../models/Gemstone.js';
import https from 'https';
import http from 'http';
import { Readable } from 'stream';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Real gemstone image URLs from Pexels (royalty free, direct download supported)
const gemstoneImages = {
  // New gemstones added by seed
  'neelam-blue-sapphire': [
    'https://images.pexels.com/photos/5370706/pexels-photo-5370706.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/4040585/pexels-photo-4040585.jpeg?auto=compress&w=800'
  ],
  'pukhraj-yellow-sapphire': [
    'https://images.pexels.com/photos/5895883/pexels-photo-5895883.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/3685175/pexels-photo-3685175.jpeg?auto=compress&w=800'
  ],
  'ruby-manik': [
    'https://images.pexels.com/photos/1616796/pexels-photo-1616796.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&w=800'
  ],
  'pearl-moti': [
    'https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&w=800'
  ],
  'opal-stone': [
    'https://images.pexels.com/photos/4040587/pexels-photo-4040587.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/6044198/pexels-photo-6044198.jpeg?auto=compress&w=800'
  ],
  'emerald-panna': [
    'https://images.pexels.com/photos/3685210/pexels-photo-3685210.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&w=800'
  ],
  // Existing gemstones
  'natural-blue-sapphire': [
    'https://images.pexels.com/photos/5370706/pexels-photo-5370706.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/4040585/pexels-photo-4040585.jpeg?auto=compress&w=800'
  ],
  'pigeon-blood-ruby': [
    'https://images.pexels.com/photos/1616796/pexels-photo-1616796.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&w=800'
  ],
  'colombian-emerald': [
    'https://images.pexels.com/photos/3685210/pexels-photo-3685210.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&w=800'
  ],
  'natural-yellow-sapphire': [
    'https://images.pexels.com/photos/5895883/pexels-photo-5895883.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/3685175/pexels-photo-3685175.jpeg?auto=compress&w=800'
  ],
  'red-coral-moonga': [
    'https://images.pexels.com/photos/4040586/pexels-photo-4040586.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/3685211/pexels-photo-3685211.jpeg?auto=compress&w=800'
  ],
  'south-sea-pearl': [
    'https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&w=800'
  ],
  'cat-s-eye': [
    'https://images.pexels.com/photos/4040584/pexels-photo-4040584.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/3685176/pexels-photo-3685176.jpeg?auto=compress&w=800'
  ]
};

// Download image from URL with proper headers
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://pixabay.com/'
      }
    };
    
    protocol.get(options, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Upload buffer to Cloudinary
async function uploadToCloudinary(buffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `kohinoor-gemstones/${folder}`,
        public_id: filename,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    Readable.from(buffer).pipe(uploadStream);
  });
}

async function addGemstoneImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);

    // Get all gemstones
    const gemstones = await Gemstone.find({});
    console.log(`\n📦 Found ${gemstones.length} gemstones in database\n`);

    for (const gemstone of gemstones) {
      const slug = gemstone.slug;
      const imageUrls = gemstoneImages[slug];
      
      if (!imageUrls || imageUrls.length === 0) {
        console.log(`⏭️  Skipping ${gemstone.name.english} - no images configured`);
        continue;
      }

      // Skip if already has 2+ images from Cloudinary
      if (gemstone.images && gemstone.images.length >= 2 && 
          gemstone.images[0]?.url?.includes('cloudinary')) {
        console.log(`✓  ${gemstone.name.english} already has ${gemstone.images.length} Cloudinary images`);
        continue;
      }

      console.log(`\n🔄 Processing: ${gemstone.name.english}`);
      
      const uploadedImages = [];
      
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const filename = `${slug}-${i + 1}`;
        
        try {
          console.log(`   📥 Downloading image ${i + 1}...`);
          const imageBuffer = await downloadImage(imageUrl);
          
          console.log(`   ☁️  Uploading to Cloudinary...`);
          const result = await uploadToCloudinary(imageBuffer, slug, filename);
          
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${gemstone.name.english} image ${i + 1}`
          });
          
          console.log(`   ✅ Uploaded: ${result.secure_url}`);
        } catch (error) {
          console.log(`   ❌ Error with image ${i + 1}: ${error.message}`);
        }
      }

      if (uploadedImages.length > 0) {
        // Update gemstone with images
        gemstone.images = uploadedImages;
        await gemstone.save();
        console.log(`   💎 Updated ${gemstone.name.english} with ${uploadedImages.length} images`);
      }
    }

    console.log('\n🎉 Gemstone images update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addGemstoneImages();
