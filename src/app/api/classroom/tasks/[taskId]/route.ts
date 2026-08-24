import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ClassroomAssessment from '@/models/classroom-assessment.model';
import ClassroomSubmission from '@/models/classroom-submission.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { assessmentsFallbackDb } from '@/utils/assessmentsFallbackDb';
import { classroomSubmissionsFallbackDb } from '@/utils/classroomSubmissionsFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const { taskId } = params;
        let userId = 'guest';

        try {
            const user = verifyUser(request);
            userId = user.userId;
        } catch (authErr) {
            console.log('No auth token, using guest access for task details');
        }

        try {
            await dbConnect();
            const assessment = await ClassroomAssessment.findById(taskId);
            if (!assessment) {
                throw new AppError('Task not found', 404);
            }

            const submission = await ClassroomSubmission.findOne({
                assessmentId: taskId,
                studentId: userId === 'guest' ? '000000000000000000000001' : userId
            });

            return apiSuccess({
                assessment,
                submission: submission || null
            });
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            
            console.warn('Database offline, checking fallback JSON database for task:', dbErr);
            const assessment = assessmentsFallbackDb.getById(taskId);
            if (!assessment) {
                throw new AppError('Task not found', 404);
            }

            const submission = classroomSubmissionsFallbackDb.getByStudentAndAssessment(
                userId === 'guest' ? '000000000000000000000001' : userId,
                taskId
            );

            return apiSuccess({
                assessment,
                submission: submission || null
            });
        }
    } catch (error) {
        return handleApiError(error);
    }
}
