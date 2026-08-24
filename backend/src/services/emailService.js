import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_default_fallback_key');

// Send email with Resend

// Minimal OTP template
const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #111111; border-radius: 8px; border: 1px solid #27272a;">
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 1px solid #27272a;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Kohinoor</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px;">
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 16px; font-weight: 500;">Verification Code</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
                Use the following code to verify your action. This code is valid for 10 minutes.
              </p>
              <div style="background: #000000; border: 1px solid #27272a; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: 6px;">${otp}</span>
              </div>
              <p style="color: #52525b; margin: 0; font-size: 12px; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Minimal Welcome template
const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #111111; border-radius: 8px; border: 1px solid #27272a;">
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 1px solid #27272a;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Kohinoor</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px;">
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 16px; font-weight: 500;">Welcome, ${name}</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
                Your account has been created successfully. Welcome to a curated collection of authentic, high-quality gemstones.
              </p>
              
              <div style="margin-bottom: 32px;">
                <h3 style="color: #ffffff; margin: 0 0 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Our Collection</h3>
                <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li><strong style="color: #e4e4e7; font-weight: 500;">Neelam</strong> (Blue Sapphire)</li>
                  <li><strong style="color: #e4e4e7; font-weight: 500;">Pukhraj</strong> (Yellow Sapphire)</li>
                  <li><strong style="color: #e4e4e7; font-weight: 500;">Ruby</strong> (Manik)</li>
                  <li><strong style="color: #e4e4e7; font-weight: 500;">Emerald</strong> (Panna)</li>
                  <li><strong style="color: #e4e4e7; font-weight: 500;">Pearl</strong> (Moti)</li>
                </ul>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="https://kohinoorgemstone.com" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 24px; border-radius: 6px;">Explore Collection</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #0a0a0a; border-top: 1px solid #27272a; border-radius: 0 0 8px 8px;">
              <p style="color: #71717a; margin: 0 0 8px; font-size: 12px; font-weight: 500;">Visit Our Store</p>
              <p style="color: #52525b; margin: 0; font-size: 12px; line-height: 1.5;">
                Shahbad, Deewan Khana, Opposite Dr. Deewedi<br>
                Bareilly, Uttar Pradesh - 243001<br>
                Expert: Ahad Beg
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY config - skipping email');
      return { success: true, skipped: true };
    }

    const from = process.env.FROM_EMAIL || 'info@kohinoorgemstone.com';
    const fromName = process.env.FROM_NAME || 'Kohinoor Gemstone';

    // Resend requires the format "Name <email@domain.com>"
    const fromString = `${fromName} <${from}>`;

    console.log('Sending email to:', to);

    const { data, error } = await resend.emails.send({
      from: fromString,
      to,
      subject,
      html
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email failed Exception:', error.message);
    return { success: false, error: error.message };
  }
};

// Send verification OTP
export const sendVerificationOTP = async (email, name, otp) => {
  return sendEmail(email, 'Your Kohinoor Verification Code', otpTemplate(otp));
};

// Send password reset OTP
export const sendPasswordResetOTP = async (email, name, otp) => {
  return sendEmail(email, 'Reset your Kohinoor password', otpTemplate(otp));
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail(email, 'Welcome to Kohinoor!', welcomeTemplate(name));
};

export default { sendEmail, sendVerificationOTP, sendPasswordResetOTP, sendWelcomeEmail };
