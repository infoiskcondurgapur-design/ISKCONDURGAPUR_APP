import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ClassroomSubmission from '@/models/classroom-submission.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { classroomSubmissionsFallbackDb } from '@/utils/classroomSubmissionsFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
            const submissions = await ClassroomSubmission.find({}).sort({ submittedAt: -1 }).lean();
            return apiSuccess(submissions);
        } catch (dbErr) {
            console.warn('Database offline, serving fallback JSON database for classroom submissions:', dbErr);
            const submissions = classroomSubmissionsFallbackDb.getAll();
            return apiSuccess(submissions);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
