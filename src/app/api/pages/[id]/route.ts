import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Page from '@/models/page.model';
import { pageFallbackDb } from '@/utils/pageFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        let page;
        try {
            await dbConnect();
            // Try to find by slug first, if not found then by ID
            page = await Page.findOne({ slug: params.id });
            if (!page && params.id.match(/^[0-9a-fA-F]{24}$/)) {
                page = await Page.findById(params.id);
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for GET /api/pages/[id]', dbErr);
            page = pageFallbackDb.getBySlug(params.id) || pageFallbackDb.getById(params.id);
        }

        if (!page) {
            return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch page', message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        const body = await req.json();
        
        // Validate slug format if slug is being updated
        if (body.slug) {
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!slugRegex.test(body.slug)) {
                return NextResponse.json({ success: false, error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' }, { status: 400 });
            }
        }

        let updatedPage;
        try {
            await dbConnect();
            
            // Check for slug uniqueness if slug is changing
            if (body.slug) {
                const existingPage = await Page.findOne({ slug: body.slug, _id: { $ne: params.id } });
                if (existingPage) {
                    return NextResponse.json({ success: false, error: 'Another page with this slug already exists.' }, { status: 400 });
                }
            }

            updatedPage = await Page.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for PUT /api/pages/[id]', dbErr);
            
            if (body.slug) {
                const existingPage = pageFallbackDb.getBySlug(body.slug);
                if (existingPage && existingPage._id !== params.id && existingPage.id !== params.id) {
                    return NextResponse.json({ success: false, error: 'Another page with this slug already exists in fallback DB.' }, { status: 400 });
                }
            }

            updatedPage = pageFallbackDb.update(params.id, body);
        }

        if (!updatedPage) {
            return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedPage, message: 'Page updated successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update page', message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);

        let deleted;
        try {
            await dbConnect();
            const result = await Page.findByIdAndDelete(params.id);
            deleted = !!result;
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for DELETE /api/pages/[id]', dbErr);
            deleted = pageFallbackDb.delete(params.id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Page deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to delete page', message: error.message }, { status: 500 });
    }
}
