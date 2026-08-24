import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { apiSuccess } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const started = Date.now();
    let database: { status: string; latencyMs?: number; error?: string } = { status: 'offline' };

    try {
        if (mongoose.connection.readyState !== 1) {
            await Promise.race([
                import('@/utils/db').then(m => m.default()),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
        }
        database = { status: 'connected', latencyMs: Date.now() - started };
    } catch (err: any) {
        database = { status: 'offline', error: String(err?.message || 'Connection failed'), latencyMs: Date.now() - started };
    }

    return apiSuccess({
        status: database.status === 'connected' ? 'healthy' : 'degraded',
        database,
        memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
}
