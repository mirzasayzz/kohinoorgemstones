import fs from 'fs';
import { sendVerificationOTP, sendWelcomeEmail } from './src/services/emailService.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from './src/utils/sendEmail.js';

// We just want the HTML output, we don't need to actually send using Resend
// Mock the internal send functions

// For emailService.js
console.log("Mocking sendEmail in emailService...");

// Use dynamic import and mock Resend globally or just capture the HTML before it sends
// A simpler way: we just read the file and extract the templates to test rendering

const content = fs.readFileSync('./src/services/emailService.js', 'utf8');

// Extract the OTP template string
const otpMatch = content.match(/const otpTemplate = \(otp\) => `([\s\S]*?)`;/);
if (otpMatch) {
    const rendered = otpMatch[1].replace('${otp}', '123456');
    fs.writeFileSync('test_otp.html', rendered);
    console.log('✅ Generated test_otp.html');
}

// Extract the Welcome template string
const welcomeMatch = content.match(/const welcomeTemplate = \(name\) => `([\s\S]*?)`;/);
if (welcomeMatch) {
    const rendered = welcomeMatch[1].replace('${name}', 'Azhar');
    fs.writeFileSync('test_welcome.html', rendered);
    console.log('✅ Generated test_welcome.html');
}

const adminContent = fs.readFileSync('./src/utils/sendEmail.js', 'utf8');

const resetMatch = adminContent.match(/const html = `([\s\S]*?)`;/);
if (resetMatch) {
    let rendered = resetMatch[1].replace("${userName || 'Admin'}", 'Azhar');
    rendered = rendered.replace('${resetUrl}', 'https://example.com/reset');
    fs.writeFileSync('test_reset.html', rendered);
    console.log('✅ Generated test_reset.html');
}

console.log("Template extraction complete.");
