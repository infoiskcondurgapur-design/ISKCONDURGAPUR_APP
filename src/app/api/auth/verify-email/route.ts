import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import User from '@/models/user.model';
import { handleApiError, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { max: 20, windowMs: 60 * 60 * 1000 });

    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      throw new AppError('Verification token is required', 400);
    }

    await dbConnect();

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification link. Please request a new one.', 400);
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.username}`);

    return NextResponse.json({
      message: 'Email verified successfully. You can now sign in.'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
