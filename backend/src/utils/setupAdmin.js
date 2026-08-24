import User from '../models/User.js';
import BusinessInfo from '../models/BusinessInfo.js';
import dotenv from 'dotenv';

dotenv.config();

export const setupDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    if (!existingAdmin) {
      console.log('🔄 Creating default admin user...');
      
      // Create default admin user
      const adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'super_admin'
      });

      console.log('✅ Default admin user created:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Ensure default business info exists
    await BusinessInfo.getBusinessInfo();
    console.log('✅ Business information initialized');

  } catch (error) {
    console.error('❌ Error setting up default admin:', error.message);
  }
};

export const displayStartupInfo = () => {
  console.log('\n🎉 KOHINOOR GEMSTONE API STARTED SUCCESSFULLY!');
  console.log('='*60);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on: http://localhost:${process.env.PORT || 5000}`);
  console.log(`💎 API Base URL: http://localhost:${process.env.PORT || 5000}/api`);
  console.log('\n📋 AVAILABLE ENDPOINTS:');
  console.log('   🔐 Auth: /api/auth/login, /api/auth/me');
  console.log('   💎 Gemstones: /api/gemstones, /api/gemstones/trending');
  console.log('   🏪 Business: /api/business/info, /api/business/contact');
  console.log('   📤 Upload: /api/upload/image, /api/upload/base64');
  console.log('   ❤️ Health: /api/health');
  console.log('\n🔑 DEFAULT ADMIN CREDENTIALS:');
  console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@gmail.com'}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('\n📱 TESTING COMMANDS:');
  console.log('   curl http://localhost:5000/api/health');
  console.log('   curl http://localhost:5000/api/business/info');
  console.log('='*60);
}; 