#!/usr/bin/env node

/**
 * Test Script for Kohinoor Gemstone API
 * Tests the contact information management via admin dashboard
 */

import axios from 'axios';
import 'dotenv/config';

const API_BASE = `${process.env.BASE_URL || process.env.BACKEND_URL || 'https://kohinoorgemstone.com'}/api`;
let authToken = null;

// Test credentials (from environment only)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_CREDENTIALS = (ADMIN_EMAIL && ADMIN_PASSWORD)
  ? { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  : null;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test functions
async function loginAdmin() {
  try {
    log('\n🔐 Testing Admin Login...', 'blue');
    if (!ADMIN_CREDENTIALS) {
      log('⚠️ Skipping login: ADMIN_EMAIL/ADMIN_PASSWORD not set in environment', 'yellow');
      return false;
    }
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success) {
      authToken = response.data.token;
      log('✅ Admin login successful!', 'green');
      log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
      return true;
    }
  } catch (error) {
    log('❌ Admin login failed:', 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testHealthEndpoint() {
  try {
    log('\n❤️ Testing Health Endpoint...', 'blue');
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.data.status === 'success') {
      log('✅ Health check passed!', 'green');
      log(`   Message: ${response.data.message}`, 'yellow');
      return true;
    }
  } catch (error) {
    log('❌ Health check failed:', 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testContactInfoRetrieval() {
  try {
    log('\n📞 Testing Contact Info Retrieval...', 'blue');
    const response = await axios.get(`${API_BASE}/business/contact-complete`);
    
    if (response.data.success) {
      log('✅ Contact info retrieved successfully!', 'green');
      const contact = response.data.data.contact;
      log(`   WhatsApp: ${contact.whatsapp}`, 'yellow');
      log(`   Email: ${contact.email}`, 'yellow');
      log(`   Address: ${contact.address?.fullAddress}`, 'yellow');
      return contact;
    }
  } catch (error) {
    log('❌ Contact info retrieval failed:', 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function testContactInfoUpdate() {
  if (!authToken) {
    log('❌ No auth token available for contact update test', 'red');
    return false;
  }

  try {
    log('\n✏️ Testing Contact Info Update...', 'blue');
    
    const updateData = {
      whatsapp: '+919876543210',
      email: 'contact@kohinoorgemstone.com',
      phone: '+919876543210',
      street: '456 Gemstone Avenue',
      area: 'Diamond District',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      googleMapsUrl: 'https://www.google.com/maps/embed?pb=custom-updated-url'
    };

    const response = await axios.put(
      `${API_BASE}/business/contact-all`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      log('✅ Contact info updated successfully!', 'green');
      log(`   New WhatsApp: ${response.data.data.contact.whatsapp}`, 'yellow');
      log(`   New Email: ${response.data.data.contact.email}`, 'yellow');
      log(`   New Address: ${response.data.data.address.fullAddress}`, 'yellow');
      return true;
    }
  } catch (error) {
    log('❌ Contact info update failed:', 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testGemstoneEndpoints() {
  try {
    log('\n💎 Testing Gemstone Endpoints...', 'blue');
    
    // Test predefined gemstones
    const predefinedResponse = await axios.get(`${API_BASE}/gemstones/predefined`);
    if (predefinedResponse.data.success) {
      log('✅ Predefined gemstones retrieved!', 'green');
      log(`   Total gemstone types: ${predefinedResponse.data.data.gemstones.length}`, 'yellow');
    }

    // Test gemstone listing
    const gemstonesResponse = await axios.get(`${API_BASE}/gemstones`);
    if (gemstonesResponse.data.success) {
      log('✅ Gemstones listing works!', 'green');
      log(`   Total gemstones: ${gemstonesResponse.data.total || 0}`, 'yellow');
    }

    return true;
  } catch (error) {
    log('❌ Gemstone endpoints test failed:', 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🎉 KOHINOOR GEMSTONE API TESTING SUITE', 'magenta');
  log('========================================', 'magenta');
  
  const results = {
    health: await testHealthEndpoint(),
    login: await loginAdmin(),
    contactRetrieval: await testContactInfoRetrieval(),
    contactUpdate: await testContactInfoUpdate(),
    gemstones: await testGemstoneEndpoints()
  };

  log('\n📊 TEST RESULTS SUMMARY', 'magenta');
  log('======================', 'magenta');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(20)} : ${status}`, color);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'yellow');

  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED! Your Kohinoor Gemstone API is working perfectly!', 'green');
    log('🔧 Admin dashboard can now manage:', 'blue');
    log('   • WhatsApp phone numbers', 'blue');
    log('   • Email addresses', 'blue');
    log('   • Complete shop address', 'blue');
    log('   • Google Maps URLs', 'blue');
  }
}

// Handle process termination gracefully
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled Promise Rejection: ${reason}`, 'red');
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
}); 