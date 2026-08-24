import User from '../models/User.js';
import BusinessInfo from '../models/BusinessInfo.js';
import dotenv from 'dotenv';

dotenv.config();

export const setupDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    
    if (!existingAdmin) {
      console.log('🔄 Creating default admin user...');
      
      // Create default admin user
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin'
      });

      console.log('✅ Default admin user created:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      // Check if we need to update credentials to match environment variables
      if (existingAdmin.email !== adminEmail) {
        console.log('🔄 Updating admin credentials to match environment...');
        
        existingAdmin.name = adminName;
        existingAdmin.email = adminEmail;
        existingAdmin.password = adminPassword; // This will be hashed by the pre-save middleware
        await existingAdmin.save();
        
        console.log('✅ Admin credentials updated:');
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Role: ${existingAdmin.role}`);
      } else {
        console.log('✅ Admin user already exists with correct credentials');
      }
    }

    // Removed auto-initialization of BusinessInfo to avoid defaults

  } catch (error) {
    console.error('❌ Error setting up default admin:', error.message);
  }
};

export const displayStartupInfo = () => {
  console.log('\n🎉 KOHINOOR GEMSTONE API STARTED SUCCESSFULLY!');
  console.log('='.repeat(60));
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
  console.log('='.repeat(60));
}; 