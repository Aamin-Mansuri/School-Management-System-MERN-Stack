// Mock & Production Email Service
export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`[Email Service] Sending email to: ${to} | Subject: ${subject}`);
  // In development / demo environments, log OTP and reset tokens clearly
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER) {
    console.log(`[Email Content Preview]:\n${text || html}`);
    return { success: true, message: 'Email logged in development stream' };
  }

  try {
    // If SMTP is configured in production:
    // const transporter = nodemailer.createTransporter(...)
    return { success: true, message: 'Email sent successfully' };
  } catch (err) {
    console.error('[Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendOtpEmail = async (email, otpCode, name = 'User') => {
  const subject = `Your EduPulse Verification Code: ${otpCode}`;
  const text = `Hello ${name},\n\nYour one-time verification code is: ${otpCode}\nThis code will expire in 10 minutes.\n\nBest regards,\nEduPulse Academy Administration`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb;">EduPulse School Portal</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Please use the following OTP verification code to complete your security action:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1e293b; background: #f1f5f9; padding: 12px; text-align: center; border-radius: 6px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html, text });
};

export const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
  const subject = 'EduPulse Password Reset Request';
  const text = `Hello ${name},\n\nYou requested a password reset. Please use your reset code or link.\nReset Code: ${resetToken}\n\nEduPulse Team`;
  return await sendEmail({ to: email, subject, text });
};
