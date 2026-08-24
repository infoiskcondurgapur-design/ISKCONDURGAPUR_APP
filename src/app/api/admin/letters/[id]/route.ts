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

// PUT /api/admin/letters/[id]  ΓÇö update a letter
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        requireAdmin(request);
        await dbConnect();

        const body = await request.json();
        const letter = await Letter.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
        if (!letter) return NextResponse.json({ error: 'Letter not found' }, { status: 404 });

        return NextResponse.json({ letter });
    } catch (error: any) {
        const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}

// DELETE /api/admin/letters/[id]  ΓÇö delete a letter
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        requireAdmin(request);
        await dbConnect();

        const letter = await Letter.findByIdAndDelete(params.id);
        if (!letter) return NextResponse.json({ error: 'Letter not found' }, { status: 404 });

        return NextResponse.json({ message: 'Letter deleted' });
    } catch (error: any) {
        const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
