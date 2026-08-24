import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'images', 'daily-updates');

export async function POST(request: NextRequest) {
    try {
        verifyAdmin(request);
        
        const formData = await request.formData();
        const date = formData.get('date') as string;
        const files = formData.getAll('images') as File[];
        
        if (!date || !files || files.length === 0) {
            return new Response(JSON.stringify({ success: false, error: 'Date and images are required' }), { status: 400 });
        }
        
        // Format date string to ensure it's safe for directory name
        const safeDate = date.replace(/[^0-9-]/g, '');
        const targetDir = path.join(UPLOADS_DIR, safeDate);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const uploadedImageUrls = [];
        
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = path.join(targetDir, fileName);
            
            fs.writeFileSync(filePath, buffer);
            // Relative path served by Next.js
            uploadedImageUrls.push(`/images/daily-updates/${safeDate}/${fileName}`);
        }
        
        return apiSuccess({ imageUrls: uploadedImageUrls }, 'Images uploaded successfully', 201);
    } catch (error) {
        return handleApiError(error);
    }
}
