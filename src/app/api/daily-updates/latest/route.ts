import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import DailyUpdate from '@/models/daily-update.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { dailyUpdatesFallbackDb } from '@/utils/dailyUpdatesFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
            const latest = await DailyUpdate.findOne({ status: 'Published' }).sort({ date: -1 });
            return apiSuccess(latest);
        } catch (dbErr) {
            console.warn('Database offline, getting latest update from fallback JSON DB:', dbErr);
            const updates = dailyUpdatesFallbackDb.getAll();
            const published = updates.filter((up: any) => up.status === 'Published');
            published.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return apiSuccess(published.length > 0 ? published[0] : null);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
