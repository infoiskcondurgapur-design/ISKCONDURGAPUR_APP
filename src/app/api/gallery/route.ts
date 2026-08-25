import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import GalleryImage from '@/models/gallery.model';
import { galleryFallbackDb } from '@/utils/galleryFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let images;
        try {
            await dbConnect();
            images = await GalleryImage.find().sort({ date: -1, createdAt: -1 });
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for GET /api/gallery', dbErr);
            images = galleryFallbackDb.getAll();
        }

        return NextResponse.json({ success: true, data: images });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch gallery images', message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);
        const body = await req.json();

        // Basic validation
        if (!body.url || !body.date) {
            return NextResponse.json({ success: false, error: 'Image URL and Date are required' }, { status: 400 });
        }

        let newImage;
        try {
            await dbConnect();
            newImage = await GalleryImage.create(body);
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for POST /api/gallery', dbErr);
            newImage = galleryFallbackDb.create(body);
        }

        return NextResponse.json({ success: true, data: newImage, message: 'Gallery image added successfully' }, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to add gallery image', message: error.message }, { status: 500 });
    }
}
