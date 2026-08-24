import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import User from '@/models/user.model';
import { handleApiError, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';
import { sendVerificationEmail } from '@/utils/mailer';

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
      'If an unverified account exists for that email, a new verification link has been sent.';

    if (!user || !user.email) {
      return NextResponse.json({ message: genericMessage });
    }

    if (user.isVerified !== false) {
      return NextResponse.json({ message: genericMessage });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.username, verifyToken);
    } catch (mailErr) {
      logger.error('Failed to resend verification email:', mailErr);
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    return handleApiError(error);
  }
}
