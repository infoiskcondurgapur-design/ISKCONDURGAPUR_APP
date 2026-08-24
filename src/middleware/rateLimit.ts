import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from '@/utils/logger';
import { AppError } from '@/utils/errorHandler';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store: Record<string, RateLimitEntry> = {};

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX = 100;

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
}

function cleanupStore(now: number) {
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Throws an AppError (429) when the caller exceeds the allowed number of
 * requests per window. Keyed by client IP.
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): void {
  const ip = getClientIp(request);
  const max = options.max ?? DEFAULT_MAX;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  cleanupStore(now);

  const entry = store[ip];

  if (!entry || entry.resetTime < now) {
    store[ip] = { count: 1, resetTime: now + windowMs };
    return;
  }

  entry.count++;

  if (entry.count > max) {
    const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
    logger.warn(`Rate limit exceeded for IP: ${ip}`, { retryAfterSec });
    throw new AppError(`Too many requests. Please try again in ${retryAfterSec} seconds.`, 429);
  }
}
