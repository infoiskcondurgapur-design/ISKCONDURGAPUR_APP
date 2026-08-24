import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import DailyUpdate from '@/models/daily-update.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { dailyUpdatesFallbackDb } from '@/utils/dailyUpdatesFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(id);
    
    try {
        try {
            await dbConnect();
            const update = isDate 
                ? await DailyUpdate.findOne({ date: id })
                : await DailyUpdate.findById(id);
            if (!update) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess(update);
        } catch (dbErr) {
            console.warn('Database offline, finding in fallback JSON DB:', dbErr);
            const update = isDate
                ? dailyUpdatesFallbackDb.getByDate(id)
                : dailyUpdatesFallbackDb.getById(id);
            if (!update) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess(update);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(id);

    try {
        verifyAdmin(request);
        const body = await request.json();

        try {
            await dbConnect();
            const query = isDate ? { date: id } : { _id: id };
            const updated = await DailyUpdate.findOneAndUpdate(query, body, { new: true, runValidators: true });
            if (!updated) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess(updated, 'Daily update updated successfully');
        } catch (dbErr) {
            console.warn('Database offline, updating in fallback JSON DB:', dbErr);
            let targetId = id;
            if (isDate) {
                const item = dailyUpdatesFallbackDb.getByDate(id);
                if (item) targetId = item._id;
            }
            const updated = dailyUpdatesFallbackDb.update(targetId, body);
            if (!updated) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess(updated, 'Daily update updated successfully in fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(id);

    try {
        verifyAdmin(request);
        try {
            await dbConnect();
            const query = isDate ? { date: id } : { _id: id };
            const deleted = await DailyUpdate.findOneAndDelete(query);
            if (!deleted) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess({}, 'Daily update deleted successfully');
        } catch (dbErr) {
            console.warn('Database offline, deleting in fallback JSON DB:', dbErr);
            let targetId = id;
            if (isDate) {
                const item = dailyUpdatesFallbackDb.getByDate(id);
                if (item) targetId = item._id;
            }
            const success = dailyUpdatesFallbackDb.delete(targetId);
            if (!success) {
                return new Response(JSON.stringify({ success: false, error: 'Daily update not found' }), { status: 404 });
            }
            return apiSuccess({}, 'Daily update deleted successfully from fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
