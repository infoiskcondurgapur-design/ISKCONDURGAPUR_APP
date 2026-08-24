import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import User from '@/models/user.model';
import { handleApiError, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';
import { sendVerificationEmail } from '@/utils/mailer';

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { max: 5, windowMs: 60 * 60 * 1000 });

    const { username, email, password, fullName } = await request.json();

    if (!username || !password || !email) {
      throw new AppError('Username, email, and password are required', 400);
    }

    const trimmedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      throw new AppError('Username must be 3-30 characters and contain only letters, numbers, and underscores', 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: trimmedUsername }, { email: normalizedEmail }]
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        throw new AppError('Username is already taken', 409);
      } else {
        throw new AppError('Email is already registered', 409);
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token (24h validity)
    const verifyToken = crypto.randomBytes(32).toString('hex');

    // Create the new user
    const newUser = new User({
      username: trimmedUsername,
      fullName: typeof fullName === 'string' && fullName.trim() ? fullName.trim() : undefined,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'devotee', // default role
      twoFactorEnabled: false,
      isVerified: false,
      verifyToken,
      verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await newUser.save();

    // Send verification email — account is still created if SMTP fails
    let verificationEmailSent = true;
    try {
      await sendVerificationEmail(normalizedEmail, trimmedUsername, verifyToken);
    } catch (mailErr) {
      verificationEmailSent = false;
      logger.error('Failed to send verification email:', mailErr);
    }

    logger.info(`New user registered: ${trimmedUsername} (${normalizedEmail})`);

    return NextResponse.json({
      message: verificationEmailSent
        ? 'Account created. Please check your email to verify your account before signing in.'
        : 'Account created, but the verification email could not be sent. Please contact support.',
      verificationEmailSent,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
