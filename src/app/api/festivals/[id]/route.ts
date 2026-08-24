import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Festival from '@/models/festival.model';
import { festivalsFallbackDb } from '@/utils/festivalsFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        const body = await req.json();
        
        let updated;
        try {
            await dbConnect();
            updated = await Festival.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
            if (!updated) {
                updated = festivalsFallbackDb.update(params.id, body);
                if (!updated) return NextResponse.json({ success: false, error: 'Festival not found' }, { status: 404 });
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for PUT /api/festivals/[id]', dbErr);
            updated = festivalsFallbackDb.update(params.id, body);
            if (!updated) return NextResponse.json({ success: false, error: 'Festival not found in fallback database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated, message: 'Festival updated successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update festival', message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        
        let deleted;
        try {
            await dbConnect();
            deleted = await Festival.findByIdAndDelete(params.id);
            if (!deleted) {
                const fallbackDeleted = festivalsFallbackDb.delete(params.id);
                if (fallbackDeleted) return NextResponse.json({ success: true, message: 'Festival deleted from fallback database' });
                return NextResponse.json({ success: false, error: 'Festival not found' }, { status: 404 });
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for DELETE /api/festivals/[id]', dbErr);
            const fallbackDeleted = festivalsFallbackDb.delete(params.id);
            if (!fallbackDeleted) return NextResponse.json({ success: false, error: 'Festival not found in fallback database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Festival deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to delete festival', message: error.message }, { status: 500 });
    }
}
