import nodemailer from 'nodemailer';

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://www.iskcondurgapur.org'
  ).replace(/\/$/, '');
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

function getFromAddress(): string {
  return process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@iskcondurgapur.org';
}

function baseEmailStyles(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #fffaf3; border-radius: 12px;">
      <h2 style="color: #FF6B00; margin-top: 0;">ISKCON Durgapur</h2>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #f0e6d8;">
  `;
}

export async function sendVerificationEmail(
  to: string,
  username: string,
  token: string
): Promise<void> {
  const verifyUrl = `${getBaseUrl()}/auth/verify-email?token=${token}`;

  await getTransporter().sendMail({
    from: getFromAddress(),
    to,
    subject: 'Verify your ISKCON Durgapur account',
    html: `
      ${baseEmailStyles()}
        <p>Hare Krishna, ${username}!</p>
        <p>Thank you for creating an account. Please confirm your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}" style="background-color: #FF6B00; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        </p>
        <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If you did not create this account, you can safely ignore this email.</p>
      </div>
    </div>
  `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  username: string,
  token: string
): Promise<void> {
  const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${token}`;

  await getTransporter().sendMail({
    from: getFromAddress(),
    to,
    subject: 'Reset your ISKCON Durgapur password',
    html: `
      ${baseEmailStyles()}
        <p>Hare Krishna, ${username}!</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #FF6B00; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </p>
        <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    </div>
  `,
  });
}
