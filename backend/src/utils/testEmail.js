import { sendVerificationOTP, sendPasswordResetOTP, sendWelcomeEmail } from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

// Test email functionality
const testEmails = async () => {
  console.log('🧪 Testing Email Service...\n');
  
  const testEmail = process.env.SMTP_EMAIL; // Use your own email for testing
  const testName = 'Test User';
  const testOTP = '123456';
  
  console.log('📧 Testing Verification OTP Email...');
  const verificationResult = await sendVerificationOTP(testEmail, testName, testOTP);
  console.log('✅ Verification Email Result:', verificationResult);
  
  console.log('\n📧 Testing Password Reset Email...');
  const resetResult = await sendPasswordResetOTP(testEmail, testName, testOTP);
  console.log('✅ Password Reset Email Result:', resetResult);
  
  console.log('\n📧 Testing Welcome Email...');
  const welcomeResult = await sendWelcomeEmail(testEmail, testName);
  console.log('✅ Welcome Email Result:', welcomeResult);
  
  console.log('\n🎉 Email tests completed!');
};

// Run tests
testEmails().catch(console.error);
