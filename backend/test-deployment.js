#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests all critical endpoints after deployment fixes
 * 
 * IMPORTANT: Set environment variables for testing:
 * - BASE_URL: API base URL (defaults to production)
 * - ADMIN_EMAIL: Admin email for auth tests (required)
 * - ADMIN_PASSWORD: Admin password for auth tests (required)
 */

const BASE_URL = process.env.BASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!BASE_URL) {
  console.error('❌ BASE_URL environment variable is required');
  console.log('   Example: BASE_URL=https://kohinoor-w94f.onrender.com');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set - auth tests will be skipped');
}

let authToken = null;

console.log('🧪 KOHINOOR DEPLOYMENT TEST SCRIPT');
console.log('==================================');
console.log(`Testing: ${BASE_URL}`);
if (ADMIN_EMAIL) console.log(`Admin: ${ADMIN_EMAIL}`);
console.log('');

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data };
    }
    
    return {
      status: response.status,
      success: response.ok,
      data: jsonData
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function testHealthCheck() {
  console.log('1️⃣  Testing Health Check...');
  const result = await makeRequest('/api/health');
  
  if (result.success && result.data.status === 'success') {
    console.log('   ✅ Health check passed');
    return true;
  } else {
    console.log('   ❌ Health check failed:', result);
    return false;
  }
}

async function testAuthentication() {
  console.log('2️⃣  Testing Authentication...');
  
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('   ⏭️  Skipped (credentials not provided)');
    return true; // Don't count as failure
  }
  
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('   ✅ Authentication successful');
    console.log(`   📝 User: ${result.data.data.user.name} (${result.data.data.user.role})`);
    return true;
  } else {
    console.log('   ❌ Authentication failed:', result);
    return false;
  }
}

async function testProtectedEndpoint() {
  console.log('3️⃣  Testing Protected Endpoint...');
  
  if (!authToken) {
    console.log('   ⏭️  Skipped (no auth token)');
    return true;
  }
  
  const result = await makeRequest('/api/auth/me');
  
  if (result.success && result.data.data.user) {
    console.log('   ✅ Protected endpoint accessible');
    return true;
  } else {
    console.log('   ❌ Protected endpoint failed:', result);
    return false;
  }
}

async function testGemstones() {
  console.log('4️⃣  Testing Gemstones API...');
  const result = await makeRequest('/api/gemstones');
  
  if (result.success && result.data.data.gemstones) {
    console.log(`   ✅ Gemstones API working (${result.data.count} items)`);
    return true;
  } else {
    console.log('   ❌ Gemstones API failed:', result);
    return false;
  }
}

async function testBusinessInfo() {
  console.log('5️⃣  Testing Business Info...');
  const result = await makeRequest('/api/business/info');
  
  if (result.success && result.data.data.businessInfo) {
    console.log('   ✅ Business info API working');
    return true;
  } else {
    console.log('   ❌ Business info API failed:', result);
    return false;
  }
}

async function testAdminStats() {
  console.log('6️⃣  Testing Admin Statistics...');
  const result = await makeRequest('/api/gemstones/stats/overview');
  
  if (result.success && result.data.data.stats) {
    console.log(`   ✅ Admin stats working (${result.data.data.stats.totalGemstones} total gems)`);
    return true;
  } else {
    console.log('   ❌ Admin stats failed:', result);
    return false;
  }
}

async function runTests() {
  const tests = [
    testHealthCheck,
    testAuthentication,
    testProtectedEndpoint,
    testGemstones,
    testBusinessInfo,
    testAdminStats
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`   💥 Test error: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 TEST RESULTS');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Deployment is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
}); 