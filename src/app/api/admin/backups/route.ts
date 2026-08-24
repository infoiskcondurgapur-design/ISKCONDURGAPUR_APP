import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/db';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

// Collections excluded from backups for privacy/security
const EXCLUDED = ['users', 'otpresets', 'errorlogs', 'sessions'];

export async function GET(request: NextRequest) {
    try {
        verifyAdmin(request);
        await dbConnect();

        const db = (mongoose.connection as any).db;
        if (!db) {
            return handleApiError(new Error('Database connection unavailable'));
        }

        const { searchParams } = new URL(request.url);
        const isExport = searchParams.get('export') === '1';

        const collections = await db.listCollections().toArray();
        const names = collections
            .map((c: any) => c.name)
            .filter((n: string) => !EXCLUDED.includes(n.toLowerCase()) && !n.startsWith('system.'));

        if (isExport) {
            const dump: Record<string, any> = {
                _meta: {
                    exportedAt: new Date().toISOString(),
                    project: 'iskcon-durgapur',
                    collections: names.length
                }
            };
            for (const name of names) {
                try {
                    dump[name] = await db.collection(name).find({}).toArray();
                } catch {
                    dump[name] = [];
                }
            }
            const dateStamp = new Date().toISOString().slice(0, 10);
            return new NextResponse(JSON.stringify(dump, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="iskcon-backup-${dateStamp}.json"`
                }
            });
        }

        const stats = [];
        for (const name of names) {
            try {
                const count = await db.collection(name).countDocuments({});
                stats.push({ name, count });
            } catch {
                stats.push({ name, count: -1 });
            }
        }
        stats.sort((a, b) => a.name.localeCompare(b.name));

        return apiSuccess({ collections: stats, generatedAt: new Date().toISOString() });
    } catch (error) {
        return handleApiError(error);
    }
}
