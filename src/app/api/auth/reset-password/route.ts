import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import User from '@/models/user.model';
import { handleApiError, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { max: 10, windowMs: 60 * 60 * 1000 });

    const { token, password } = await request.json();

    if (!token || typeof token !== 'string') {
      throw new AppError('Reset token is required', 400);
    }

    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset link. Please request a new one.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Consume the token and auto-verify (proves email ownership)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    if (user.isVerified === false) {
      user.isVerified = true;
      user.verifyToken = undefined;
      user.verifyTokenExpiry = undefined;
    }

    await user.save();

    logger.info(`Password reset completed for user: ${user.username}`);

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now sign in.'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
