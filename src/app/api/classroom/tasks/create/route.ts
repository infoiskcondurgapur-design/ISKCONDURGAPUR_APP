import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ClassroomAssessment from '@/models/classroom-assessment.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { assessmentsFallbackDb } from '@/utils/assessmentsFallbackDb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        verifyAdmin(request);
        const body = await request.json();

        if (!body.batchId || !body.title || !body.dueDate) {
            throw new AppError('batchId, title and dueDate are required', 400);
        }

        try {
            await dbConnect();
            const assessment = await ClassroomAssessment.create(body);
            return apiSuccess(assessment, 'Task created successfully', 201);
        } catch (dbErr) {
            console.warn('Database offline, storing assessment in fallback database:', dbErr);
            const assessment = assessmentsFallbackDb.create(body);
            return apiSuccess(assessment, 'Task created in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
