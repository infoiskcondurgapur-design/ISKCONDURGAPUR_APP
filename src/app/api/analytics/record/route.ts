import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PageView from '@/models/pageview.model';

export const dynamic = 'force-dynamic';

function parseUserAgent(ua: string) {
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let browserName = 'Other';

  if (!ua) return { deviceType, browserName };

  // Parse Device Type
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Parse Browser Name
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera|chromium/i.test(ua)) {
    browserName = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios|chromium|android|blackberry/i.test(ua)) {
    browserName = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browserName = 'Firefox';
  } else if (/edge|edg/i.test(ua)) {
    browserName = 'Edge';
  } else if (/opera|opr/i.test(ua)) {
    browserName = 'Opera';
  }

  return { deviceType, browserName };
}

/**
 * Classifies a raw referrer URL into a human-readable traffic source name.
 */
function classifyReferrer(referrer: string): string {
  if (!referrer || referrer === 'direct' || referrer === '') return 'Direct';

  try {
    const hostname = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');

    if (hostname.includes('google')) return 'Google Search';
    if (hostname.includes('bing')) return 'Bing Search';
    if (hostname.includes('yahoo')) return 'Yahoo Search';
    if (hostname.includes('facebook') || hostname.includes('fb.com') || hostname.includes('fb.me')) return 'Facebook';
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'YouTube Referrals';
    if (hostname.includes('whatsapp')) return 'WhatsApp';
    if (hostname.includes('twitter') || hostname.includes('t.co') || hostname.includes('x.com')) return 'Twitter / X';
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('telegram')) return 'Telegram';

    return hostname || 'Other';
  } catch {
    return 'Direct';
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { path, sessionId, referrer } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ error: 'Missing path or sessionId' }, { status: 400 });
    }

    const ua = request.headers.get('user-agent') || '';
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Multi-provider city detection: Vercel ΓåÆ Cloudflare ΓåÆ generic ΓåÆ fallback
    const city =
      request.headers.get('x-vercel-ip-city') ||
      request.headers.get('cf-ipcity') ||
      request.headers.get('x-city') ||
      (ip === '127.0.0.1' || ip === '::1' ? 'Local' : null);

    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country') ||
      'Unknown';

    const { deviceType, browserName } = parseUserAgent(ua);
    const trafficSource = classifyReferrer(referrer);

    await PageView.create({
      path,
      sessionId,
      ip,
      userAgent: ua,
      deviceType,
      browserName,
      referrer: trafficSource,        // store classified name, not raw URL
      city: city || country,          // fallback to country if city unavailable
      country,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error logging page view:', error);
    return NextResponse.json({ error: 'Failed to log page view: ' + error.message }, { status: 500 });
  }
}
