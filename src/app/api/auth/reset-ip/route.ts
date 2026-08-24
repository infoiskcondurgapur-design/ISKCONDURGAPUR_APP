import { NextRequest, NextResponse } from 'next/server';
import { ipBlocker } from '@/middleware/ipBlock';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError } from '@/utils/errorHandler';

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    ipBlocker.clear();
    return NextResponse.json({ message: 'IP blocks cleared successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
