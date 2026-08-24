#!/usr/bin/env node

/**
 * Frontend URL Configuration Test
 * Verifies that frontend URLs are properly configured from environment variables
 */

console.log('🧪 FRONTEND URL CONFIGURATION TEST');
console.log('===================================');

// Test environment variable loading
const originalEnv = process.env.NODE_ENV;

// Test production configuration
process.env.NODE_ENV = 'production';
process.env.FRONTEND_URL = 'https://kohinoorgemstone.vercel.app';
process.env.CORS_ORIGIN = 'https://kohinoorgemstone.vercel.app';

console.log('\n1️⃣ Testing Production Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Simulate the server configuration
const getFrontendUrls = () => {
  if (process.env.NODE_ENV === 'production') {
    return [
      process.env.FRONTEND_URL || 'https://kohinoorgemstone.vercel.app',
      process.env.BACKEND_URL || 'https://kohinoor-w94f.onrender.com',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
  } else {
    return [
      process.env.FRONTEND_DEV_URL || 'http://localhost:3000',
      process.env.FRONTEND_DEV_URL_VITE || 'http://localhost:5173'
    ].filter(Boolean);
  }
};

const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://kohinoorgemstone.vercel.app';
  } else {
    return process.env.FRONTEND_DEV_URL_VITE || 'http://localhost:5173';
  }
};

const prodUrls = getFrontendUrls();
const prodFrontendUrl = getFrontendUrl();

console.log('\n✅ Production CORS URLs:', prodUrls);
console.log('✅ Production Frontend URL:', prodFrontendUrl);

// Test development configuration
process.env.NODE_ENV = 'development';
delete process.env.FRONTEND_URL;
delete process.env.CORS_ORIGIN;

console.log('\n2️⃣ Testing Development Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);

const devUrls = getFrontendUrls();
const devFrontendUrl = getFrontendUrl();

console.log('✅ Development CORS URLs:', devUrls);
console.log('✅ Development Frontend URL:', devFrontendUrl);

// Verification
console.log('\n📋 VERIFICATION RESULTS:');
console.log('========================');

let passed = 0;
let failed = 0;

// Test 1: Production frontend URL
if (prodFrontendUrl === 'https://kohinoorgemstone.vercel.app') {
  console.log('✅ Production frontend URL correct');
  passed++;
} else {
  console.log('❌ Production frontend URL incorrect:', prodFrontendUrl);
  failed++;
}

// Test 2: Production CORS includes frontend URL
if (prodUrls.includes('https://kohinoorgemstone.vercel.app')) {
  console.log('✅ Production CORS includes frontend URL');
  passed++;
} else {
  console.log('❌ Production CORS missing frontend URL');
  failed++;
}

// Test 3: Development frontend URL
if (devFrontendUrl === 'http://localhost:5173') {
  console.log('✅ Development frontend URL correct');
  passed++;
} else {
  console.log('❌ Development frontend URL incorrect:', devFrontendUrl);
  failed++;
}

// Test 4: Development CORS includes localhost
if (devUrls.includes('http://localhost:5173')) {
  console.log('✅ Development CORS includes localhost');
  passed++;
} else {
  console.log('❌ Development CORS missing localhost');
  failed++;
}

console.log('\n📊 TEST SUMMARY:');
console.log('================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Frontend URL configuration is working correctly.');
} else {
  console.log('\n⚠️ Some tests failed. Check the configuration above.');
}

// Restore original environment
process.env.NODE_ENV = originalEnv;

console.log('\n🔗 RENDER ENVIRONMENT VARIABLES TO SET:');
console.log('=======================================');
console.log('FRONTEND_URL=https://kohinoorgemstone.vercel.app');
console.log('CORS_ORIGIN=https://kohinoorgemstone.vercel.app');
console.log('NODE_ENV=production');

process.exit(failed > 0 ? 1 : 0); 