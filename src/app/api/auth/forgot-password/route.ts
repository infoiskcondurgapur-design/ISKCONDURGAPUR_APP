import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import User from '@/models/user.model';
import { handleApiError, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';
import { sendPasswordResetEmail } from '@/utils/mailer';

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { max: 10, windowMs: 60 * 60 * 1000 });

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      throw new AppError('Email is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    await dbConnect();

    const user = await User.findOne({ email: normalizedEmail });

    // Generic response — never reveal whether an account exists
    const genericMessage =
      'If an account exists for that email, a password reset link has been sent.';

    if (!user || !user.email) {
      return NextResponse.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (mailErr) {
      // Still return generic success so we don't leak account existence or SMTP state
      logger.error('Failed to send password reset email:', mailErr);
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    return handleApiError(error);
  }
}
