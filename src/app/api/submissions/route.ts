import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Submission from '@/models/submission.model';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        verifyAdmin(request);
        await dbConnect();
        const submissions = await Submission.find({}).sort({ createdAt: -1 }).lean();
        return apiSuccess(submissions);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, email, phone, type, message } = body;
        
        if (!name || !email || !phone || !type || !message) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const newSubmission = await Submission.create({ name, email, phone, type, message });
        return apiSuccess(newSubmission, 'Submission created successfully', 201);
    } catch (error) {
        return handleApiError(error);
    }
}
