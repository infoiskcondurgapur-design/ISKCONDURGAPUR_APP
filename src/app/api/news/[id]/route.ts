import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import News from '@/models/news.model';
import { newsFallbackDb } from '@/utils/newsFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        const body = await req.json();
        
        let updated;
        try {
            await dbConnect();
            updated = await News.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
            if (!updated) {
                updated = newsFallbackDb.update(params.id, body);
                if (!updated) return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for PUT /api/news/[id]', dbErr);
            updated = newsFallbackDb.update(params.id, body);
            if (!updated) return NextResponse.json({ success: false, error: 'News not found in fallback database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated, message: 'News updated successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update news', message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        
        let deleted;
        try {
            await dbConnect();
            deleted = await News.findByIdAndDelete(params.id);
            if (!deleted) {
                const fallbackDeleted = newsFallbackDb.delete(params.id);
                if (fallbackDeleted) return NextResponse.json({ success: true, message: 'News deleted from fallback database' });
                return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for DELETE /api/news/[id]', dbErr);
            const fallbackDeleted = newsFallbackDb.delete(params.id);
            if (!fallbackDeleted) return NextResponse.json({ success: false, error: 'News not found in fallback database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'News deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to delete news', message: error.message }, { status: 500 });
    }
}
