import nodemailer from 'nodemailer';

const HAS_SMTP = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = HAS_SMTP
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM = process.env.SMTP_FROM || 'Stag.io <noreply@stagio.com>';
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\nVerification code for ${to}: ${code}\n`);
  }

  if (!transporter) return;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Stag.io — Verify your email',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FDF8F0; border-radius: 12px; overflow: hidden;">
        <div style="background: #4B2E2B; padding: 24px; text-align: center;">
          <h1 style="color: #C8A96A; margin: 0; font-size: 22px;">Stag.io</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="color: #4B2E2B; margin: 0 0 8px;">Verify your email</h2>
          <p style="color: #7A4E3A; font-size: 14px;">Enter this code to complete your registration:</p>
          <div style="background: #4B2E2B; color: #C8A96A; font-size: 32px; letter-spacing: 8px; font-weight: bold; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 16px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">This code expires in 15 minutes.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\nPassword reset link for ${to}: ${resetLink}\n`);
  }

  if (!transporter) return;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Stag.io — Reset your password',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FDF8F0; border-radius: 12px; overflow: hidden;">
        <div style="background: #4B2E2B; padding: 24px; text-align: center;">
          <h1 style="color: #C8A96A; margin: 0; font-size: 22px;">Stag.io</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="color: #4B2E2B; margin: 0 0 8px;">Reset your password</h2>
          <p style="color: #7A4E3A; font-size: 14px;">Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #4B2E2B; color: #F5EFE6; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
}
