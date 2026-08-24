import dotenv from 'dotenv';
import pkg from 'nodemailer';
const { createTransport } = pkg;

// Load environment variables
dotenv.config();

console.log('🔧 Testing Email Configuration...\n');

// Check config
console.log('📧 Email Config:');
console.log('  Host:', process.env.SMTP_HOST);
console.log('  Port:', process.env.SMTP_PORT);
console.log('  Email:', process.env.SMTP_EMAIL);
console.log('  Has Password:', !!process.env.SMTP_APP_PASSWORD);
console.log('  From Name:', process.env.FROM_NAME);
console.log('  From Email:', process.env.FROM_EMAIL);
console.log('');

async function testEmail() {
  try {
    // Create transporter
    const transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug output
      logger: true // Enable bunyan logger
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_EMAIL, // Send to yourself
      subject: 'Test Email - Kohinoor OTP System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">✅ Email Configuration Test Successful!</h2>
          <p>Your email configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Test OTP:</strong> <span style="font-size: 24px; font-weight: bold; color: #f59e0b;">123456</span></p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">This is what your OTP emails will look like.</p>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent from: ${process.env.FROM_EMAIL}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check your inbox:', process.env.SMTP_EMAIL);
    
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication Error - Possible causes:');
      console.error('1. App password is incorrect');
      console.error('2. 2-Step Verification is not enabled on your Gmail');
      console.error('3. Less secure app access might be blocked');
      console.error('\nTo fix:');
      console.error('1. Go to https://myaccount.google.com/security');
      console.error('2. Enable 2-Step Verification');
      console.error('3. Go to https://myaccount.google.com/apppasswords');
      console.error('4. Generate a new app password for "Mail"');
      console.error('5. Update SMTP_APP_PASSWORD in .env (no spaces)');
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      console.error('\n⚠️  Connection Error - Possible causes:');
      console.error('1. Network/firewall blocking SMTP');
      console.error('2. Incorrect SMTP host or port');
      console.error('3. Internet connection issues');
    } else {
      console.error('Full error:', error);
    }
  }
}

// Run test
testEmail();