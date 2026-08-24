import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ErrorLog from '@/models/error-log.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        verifyAdmin(request);
        await dbConnect();
        const errors = await ErrorLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
        return apiSuccess(errors);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        verifyAdmin(request);
        await dbConnect();
        await ErrorLog.deleteMany({});
        return apiSuccess(null, 'Error logs cleared', 200);
    } catch (error) {
        return handleApiError(error);
    }
}
