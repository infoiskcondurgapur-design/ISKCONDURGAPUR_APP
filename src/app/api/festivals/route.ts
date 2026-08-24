import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Festival from '@/models/festival.model';
import { festivalsFallbackDb } from '@/utils/festivalsFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');

        let list;
        try {
            await dbConnect();
            const query = statusFilter ? { status: statusFilter } : {};
            list = await Festival.find(query).sort({ date: 1, createdAt: -1 });
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for GET /api/festivals', dbErr);
            list = festivalsFallbackDb.getAll();
            if (statusFilter) {
                list = list.filter((item: any) => item.status === statusFilter);
            }
            // Sort by date ascending
            list.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        return NextResponse.json({ success: true, data: list });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch festivals', message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);
        const body = await req.json();

        if (!body.name || !body.date || !body.timing) {
            return NextResponse.json({ success: false, error: 'Name, Date, and Timing are required' }, { status: 400 });
        }

        let newEntry;
        try {
            await dbConnect();
            newEntry = await Festival.create(body);
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for POST /api/festivals', dbErr);
            newEntry = festivalsFallbackDb.create(body);
        }

        return NextResponse.json({ success: true, data: newEntry, message: 'Festival added successfully' }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to add festival', message: error.message }, { status: 500 });
    }
}
