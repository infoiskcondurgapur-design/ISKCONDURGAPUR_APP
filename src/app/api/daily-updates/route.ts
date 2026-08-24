import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import DailyUpdate from '@/models/daily-update.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { dailyUpdatesFallbackDb } from '@/utils/dailyUpdatesFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
            const updates = await DailyUpdate.find({}).sort({ date: -1 });
            return apiSuccess(updates);
        } catch (dbErr) {
            console.warn('Database offline, serving fallback JSON database for daily updates:', dbErr);
            const updates = dailyUpdatesFallbackDb.getAll();
            updates.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return apiSuccess(updates);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        verifyAdmin(request);
        const body = await request.json();
        
        if (!body.date || !body.title || !body.message) {
            return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
        }

        try {
            await dbConnect();
            
            const existing = await DailyUpdate.findOne({ date: body.date });
            if (existing) {
                return new Response(JSON.stringify({ success: false, error: 'An update for this date already exists.' }), { status: 400 });
            }
            
            const newUpdate = await DailyUpdate.create(body);
            return apiSuccess(newUpdate, 'Daily update created successfully', 201);
        } catch (dbErr) {
            console.warn('Database offline, storing daily update in fallback JSON database:', dbErr);
            // Check existing in fallback
            const existing = dailyUpdatesFallbackDb.getByDate(body.date);
            if (existing) {
                return new Response(JSON.stringify({ success: false, error: 'An update for this date already exists.' }), { status: 400 });
            }
            const newUpdate = dailyUpdatesFallbackDb.create(body);
            return apiSuccess(newUpdate, 'Daily update created successfully in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
