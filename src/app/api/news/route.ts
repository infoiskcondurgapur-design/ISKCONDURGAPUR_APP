import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import News from '@/models/news.model';
import { newsFallbackDb } from '@/utils/newsFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');

        let newsList;
        try {
            await dbConnect();
            const query = statusFilter ? { status: statusFilter } : {};
            newsList = await News.find(query).sort({ date: -1, createdAt: -1 });
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for GET /api/news', dbErr);
            newsList = newsFallbackDb.getAll();
            if (statusFilter) {
                newsList = newsList.filter((n: any) => n.status === statusFilter);
            }
        }

        return NextResponse.json({ success: true, data: newsList });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch news', message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);
        const body = await req.json();

        if (!body.title || !body.content || !body.date) {
            return NextResponse.json({ success: false, error: 'Title, Content, and Date are required' }, { status: 400 });
        }

        let newEntry;
        try {
            await dbConnect();
            newEntry = await News.create(body);
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for POST /api/news', dbErr);
            newEntry = newsFallbackDb.create(body);
        }

        return NextResponse.json({ success: true, data: newEntry, message: 'News added successfully' }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to add news', message: error.message }, { status: 500 });
    }
}
