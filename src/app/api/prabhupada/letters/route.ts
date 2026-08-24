import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Letter from '@/models/letter.model';

export const dynamic = 'force-dynamic';

// GET /api/prabhupada/letters  ΓÇö paginated, searchable, filterable
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const search = searchParams.get('search')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const query: any = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const [letters, total, categories] = await Promise.all([
            Letter.find(query)
                .sort(search ? { score: { $meta: 'textScore' } } : { date: 1 })
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
        console.error('Error fetching letters:', error);
        return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
    }
}
