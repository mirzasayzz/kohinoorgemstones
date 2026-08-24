import User from '../models/User.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

export const setupDefaultAdmin = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const adminPasswordEnv = process.env.ADMIN_PASSWORD;
    const adminNameEnv = process.env.ADMIN_NAME;

    if (!existingAdmin) {
      // Only create when ENV provides explicit credentials
      if (adminEmailEnv && adminPasswordEnv) {
        console.log('🔄 Creating admin user from environment...');
        await User.create({
          name: adminNameEnv || 'Admin User',
          email: adminEmailEnv,
          password: adminPasswordEnv,
          role: 'super_admin'
        });
        console.log('✅ Admin user created from environment');
      } else {
        console.log('⚠️ No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD not set. Skipping auto-create.');
      }
    } else {
      // Update ONLY when explicit env overrides are provided
      let updated = false;
      if (adminNameEnv && existingAdmin.name !== adminNameEnv) {
        existingAdmin.name = adminNameEnv;
        updated = true;
      }
      if (adminEmailEnv && existingAdmin.email !== adminEmailEnv) {
        existingAdmin.email = adminEmailEnv;
        updated = true;
      }
      if (adminPasswordEnv) {
        // Update password only if provided via env
        existingAdmin.password = adminPasswordEnv; // pre-save hook will hash
        updated = true;
      }

      if (updated) {
        console.log('🔄 Updating admin credentials from environment overrides...');
        await existingAdmin.save();
        console.log('✅ Admin credentials updated');
      } else {
        console.log('✅ Admin user already exists (no env overrides applied)');
      }
    }

    // Removed auto-initialization of BusinessInfo to avoid defaults

    // Seed default categories
    try {
      const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
      if (adminUser) {
        await Category.seedDefaultCategories(adminUser._id);
      }
    } catch (categoryError) {
      console.error('❌ Error seeding categories:', categoryError.message);
    }

  } catch (error) {
    console.error('❌ Error setting up default admin:', error.message);
  }
};

export const displayStartupInfo = () => {
  const port = process.env.PORT;
  const baseUrl = process.env.BASE_URL;
  
  console.log('\n🎉 KOHINOOR GEMSTONE API STARTED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on: ${baseUrl}`);
  console.log(`💎 API Base URL: ${baseUrl}/api`);
  console.log('\n📋 AVAILABLE ENDPOINTS:');
  console.log('   🔐 Auth: /api/auth/login, /api/auth/me');
  console.log('   💎 Gemstones: /api/gemstones, /api/gemstones/trending');
  console.log('   🏪 Business: /api/business/info, /api/business/contact');
  console.log('   📤 Upload: /api/upload/image, /api/upload/base64');
  console.log('   ❤️ Health: /api/health');
  console.log('\n📱 TESTING COMMANDS:');
  console.log(`   curl ${baseUrl}/api/health`);
  console.log(`   curl ${baseUrl}/api/business/info`);
  console.log('='.repeat(60));
};
 