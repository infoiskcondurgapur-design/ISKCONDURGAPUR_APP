import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import GalleryImage from '@/models/gallery.model';
import { galleryFallbackDb } from '@/utils/galleryFallbackDb';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await verifyAdmin(req);
        
        let deleted;
        try {
            await dbConnect();
            deleted = await GalleryImage.findByIdAndDelete(params.id);
            if (!deleted) {
                // If not found in Mongo, try fallback just in case
                const fallbackDeleted = galleryFallbackDb.delete(params.id);
                if (fallbackDeleted) return NextResponse.json({ success: true, message: 'Image deleted from fallback database' });
                return NextResponse.json({ success: false, error: 'Gallery image not found' }, { status: 404 });
            }
        } catch (dbErr) {
            console.warn('Database offline, using fallback JSON for DELETE /api/gallery/[id]', dbErr);
            const fallbackDeleted = galleryFallbackDb.delete(params.id);
            if (!fallbackDeleted) return NextResponse.json({ success: false, error: 'Gallery image not found in fallback database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Gallery image deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to delete gallery image', message: error.message }, { status: 500 });
    }
}
