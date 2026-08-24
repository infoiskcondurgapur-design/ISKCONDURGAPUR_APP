import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from '@/utils/logger';

interface BlockedIP {
  ip: string;
  reason: string;
  blockedUntil: number;
}

class IPBlocker {
  private static instance: IPBlocker;
  private blockedIPs: Map<string, BlockedIP>;
  private suspiciousActivities: Map<string, number>;
  
  private constructor() {
    this.blockedIPs = new Map();
    this.suspiciousActivities = new Map();
  }

  static getInstance(): IPBlocker {
    if (!IPBlocker.instance) {
      IPBlocker.instance = new IPBlocker();
    }
    return IPBlocker.instance;
  }

  isBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip);
    if (blocked && blocked.blockedUntil > Date.now()) {
      return true;
    }
    if (blocked) {
      this.blockedIPs.delete(ip);
    }
    return false;
  }

  blockIP(ip: string, reason: string, duration: number = 24 * 60 * 60 * 1000) { // Default 24 hours
    this.blockedIPs.set(ip, {
      ip,
      reason,
      blockedUntil: Date.now() + duration
    });
    logger.warn(`IP blocked: ${ip}, Reason: ${reason}, Duration: ${duration}ms`);
  }

  recordSuspiciousActivity(ip: string) {
    const count = (this.suspiciousActivities.get(ip) || 0) + 1;
    this.suspiciousActivities.set(ip, count);

    if (count >= 5) { // Block after 5 suspicious activities
      this.blockIP(ip, 'Multiple suspicious activities');
      this.suspiciousActivities.delete(ip);
    }
  }

  getBlockInfo(ip: string): BlockedIP | undefined {
    return this.blockedIPs.get(ip);
  }

  clear() {
    this.blockedIPs.clear();
    this.suspiciousActivities.clear();
    logger.info('All IP blocks and suspicious activity records cleared');
  }
}

export const ipBlocker = IPBlocker.getInstance();

export function ipBlockMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';

  if (ipBlocker.isBlocked(ip)) {
    const info = ipBlocker.getBlockInfo(ip);
    logger.warn(`Blocked IP attempted access: ${ip}`, info);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Access denied',
        reason: info?.reason,
        blockedUntil: info?.blockedUntil
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return NextResponse.next();
}
