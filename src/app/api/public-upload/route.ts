import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { rateLimit } from '@/middleware/rateLimit';

export const dynamic = 'force-dynamic';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'forms');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'
];

export async function POST(request: NextRequest) {
    try {
        rateLimit(request, { windowMs: 60 * 60 * 1000, max: 20 });

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            throw new AppError('No files provided', 400);
        }
        if (files.length > 5) {
            throw new AppError('Maximum 5 files per submission', 400);
        }

        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        const urls = [];

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                throw new AppError(`File "${file.name}" exceeds the 10 MB limit`, 400);
            }
            const ext = path.extname(file.name).toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                throw new AppError(`File type "${ext}" is not allowed`, 400);
            }
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
            const filePath = path.join(UPLOADS_DIR, fileName);
            fs.writeFileSync(filePath, buffer);
            urls.push({ url: `/uploads/forms/${fileName}`, name: file.name, size: file.size });
        }

        return apiSuccess({ urls }, 'Files uploaded successfully', 201);
    } catch (error) {
        return handleApiError(error);
    }
}
