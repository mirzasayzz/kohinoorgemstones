import { Resend } from 'resend';

const sendEmail = async (options) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] No RESEND_API_KEY config - skipping email');
      return { success: true, skipped: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY || 're_default_fallback_key');

    const fromAddress = process.env.FROM_EMAIL || 'info@kohinoorgemstone.com';
    const fromName = process.env.FROM_NAME || 'Kohinoor Admin';
    const fromString = `${fromName} <${fromAddress}>`;

    console.log('[Email] From:', fromString, 'To:', options.email, 'Subject:', options.subject);

    const { data, error } = await resend.emails.send({
      from: fromString,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    });

    if (error) {
      console.error('[Email] Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('[Email] Sent OK. MessageId:', data?.id);
    return data;
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    throw err;
  }
};

// Minimal Password reset email template
export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  const html = `
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
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Kohinoor System</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px;">
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 16px; font-weight: 500;">Reset Password</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
                Hi ${userName || 'Admin'},<br><br>
                We received a request to reset your password. Click the button below to verify your identity and create a new password.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 24px; border-radius: 6px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="color: #52525b; margin: 0; font-size: 12px; line-height: 1.5;">
                This link will expire in 30 minutes. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    email,
    subject: 'Action Required: Password Reset - Kohinoor',
    html
  });
};

// Minimal Password changed confirmation email
export const sendPasswordChangedEmail = async (email, userName) => {
  const html = `
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
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Kohinoor System</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px;">
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 16px; font-weight: 500;">Password Changed Successfully</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
                Hi ${userName || 'Admin'},<br><br>
                This is a confirmation that the password for your Kohinoor Admin account was just changed. 
                You can now log in using your new credentials.
              </p>
              <p style="color: #52525b; margin: 0; font-size: 12px; line-height: 1.5;">
                If you did not make this change, please contact another administrator immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    email,
    subject: 'Security Notice: Password Changed - Kohinoor',
    html
  });
};

export default sendEmail;
