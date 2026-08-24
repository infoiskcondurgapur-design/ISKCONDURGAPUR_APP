import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Page from '@/models/page.model';
import { pageFallbackDb } from '@/utils/pageFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');

        let pagesList;
        try {
            await dbConnect();
            const query = statusFilter ? { status: statusFilter } : {};
            pagesList = await Page.find(query).sort({ createdAt: -1 });
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for GET /api/pages', dbErr);
            pagesList = pageFallbackDb.getAll();
            if (statusFilter) {
                pagesList = pagesList.filter((p: any) => p.status === statusFilter);
            }
        }

        return NextResponse.json({ success: true, data: pagesList });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch pages', message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);
        const body = await req.json();

        if (!body.title || !body.slug || !body.content) {
            return NextResponse.json({ success: false, error: 'Title, Slug, and Content are required' }, { status: 400 });
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(body.slug)) {
            return NextResponse.json({ success: false, error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' }, { status: 400 });
        }

        let newEntry;
        try {
            await dbConnect();
            
            // Check if slug already exists
            const existingPage = await Page.findOne({ slug: body.slug });
            if (existingPage) {
                return NextResponse.json({ success: false, error: 'A page with this slug already exists.' }, { status: 400 });
            }

            newEntry = await Page.create(body);
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for POST /api/pages', dbErr);
            
            const existingPage = pageFallbackDb.getBySlug(body.slug);
            if (existingPage) {
                return NextResponse.json({ success: false, error: 'A page with this slug already exists in fallback DB.' }, { status: 400 });
            }

            newEntry = pageFallbackDb.create(body);
        }

        return NextResponse.json({ success: true, data: newEntry, message: 'Page created successfully' }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to create page', message: error.message }, { status: 500 });
    }
}
