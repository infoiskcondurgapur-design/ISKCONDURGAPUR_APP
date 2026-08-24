import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '@/utils/logger';
import dbConnect from '@/utils/db';
import SiteStats from '@/models/stats.model';

const VISITOR_COOKIE = 'vid';
const ONE_YEAR = 60 * 60 * 24 * 365;

// Reads cookies + mutates DB per request — never render statically
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const vid = request.cookies.get(VISITOR_COOKIE)?.value;
    const isNewVisitor = !vid;

    await dbConnect();

    if (isNewVisitor) {
      // Atomic increment — safe under concurrent first visits
      await SiteStats.findOneAndUpdate(
        { key: 'site' },
        { $inc: { totalVisitors: 1 } },
        { upsert: true }
      );
    }

    const stats = await SiteStats.findOne({ key: 'site' });
    const res = NextResponse.json({ totalVisitors: stats?.totalVisitors ?? 0 });

    if (isNewVisitor) {
      res.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ONE_YEAR,
        path: '/',
      });
    }

    return res;
  } catch (error) {
    // The counter must never break the site — degrade gracefully
    logger.error('Visitor counter error:', error);
    return NextResponse.json({ totalVisitors: null });
  }
}
