import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '@/utils/db';
import Letter from '@/models/letter.model';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

function requireAdmin(request: NextRequest) {
    const token =
        request.cookies.get('iskcon_admin_token')?.value ||
        request.headers.get('Authorization')?.split(' ')[1];
    if (!token) throw new Error('Unauthorized');
    const decoded = verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') throw new Error('Forbidden');
    return decoded;
}

// GET  /api/admin/letters  ΓÇö list with pagination + search
export async function GET(request: NextRequest) {
    try {
        requireAdmin(request);
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const search = searchParams.get('search')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const query: any = {};
        if (search) query.$text = { $search: search };
        if (category && category !== 'All') query.category = category;

        const skip = (page - 1) * limit;

        const [letters, total, categories] = await Promise.all([
            Letter.find(query)
                .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Letter.countDocuments(query),
            Letter.distinct('category'),
        ]);

        return NextResponse.json({
            letters,
            total,
            page,
            pages: Math.ceil(total / limit),
            categories: ['All', ...categories.sort()],
        });
    } catch (error: any) {
        const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}

// POST /api/admin/letters  ΓÇö create one OR bulk import
export async function POST(request: NextRequest) {
    try {
        requireAdmin(request);
        await dbConnect();

        const body = await request.json();

        // Bulk import: { letters: [...] }
        if (Array.isArray(body.letters)) {
            if (body.letters.length === 0) {
                return NextResponse.json({ error: 'No letters provided' }, { status: 400 });
            }
            const result = await Letter.insertMany(body.letters, { ordered: false });
            return NextResponse.json({ message: `Imported ${result.length} letters` }, { status: 201 });
        }

        // Single create
        const { title, recipient, date, location, category, body: letterBody, tags } = body;
        if (!title || !recipient || !date || !letterBody) {
            return NextResponse.json({ error: 'title, recipient, date, and body are required' }, { status: 400 });
        }

        const letter = await Letter.create({ title, recipient, date, location, category, body: letterBody, tags });
        return NextResponse.json({ letter }, { status: 201 });
    } catch (error: any) {
        const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
