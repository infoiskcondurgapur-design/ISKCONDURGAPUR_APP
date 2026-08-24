import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PageView from '@/models/pageview.model';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch counts in parallel
    const [totalViews, uniqueSessions] = await Promise.all([
      PageView.countDocuments({}),
      PageView.distinct('sessionId')
    ]);

    const totalVisitors = uniqueSessions.length;

    return NextResponse.json({
      totalViews,
      totalVisitors
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching visitor counts:', error);
    return NextResponse.json({ error: 'Failed to fetch visitor counts: ' + error.message }, { status: 500 });
  }
}
