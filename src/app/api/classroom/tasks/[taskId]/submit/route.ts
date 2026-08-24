import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ClassroomSubmission from '@/models/classroom-submission.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { classroomSubmissionsFallbackDb } from '@/utils/classroomSubmissionsFallbackDb';

export async function POST(
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
            console.log('User submitting task as guest');
        }

        const body = await request.json();
        const { textSubmission, audioUrl, fileUrl, fileName } = body;

        try {
            await dbConnect();
            
            // Check if there is already a submission
            let submission = await ClassroomSubmission.findOne({
                assessmentId: taskId,
                studentId: userId === 'guest' ? '000000000000000000000001' : userId
            });

            if (submission) {
                submission.textSubmission = textSubmission || submission.textSubmission;
                submission.audioUrl = audioUrl || submission.audioUrl;
                submission.fileUrl = fileUrl || submission.fileUrl;
                submission.fileName = fileName || submission.fileName;
                submission.status = 'Submitted';
                submission.submittedAt = new Date();
                await submission.save();
            } else {
                submission = await ClassroomSubmission.create({
                    assessmentId: taskId,
                    studentId: userId === 'guest' ? '000000000000000000000001' : userId,
                    textSubmission,
                    audioUrl,
                    fileUrl,
                    fileName,
                    status: 'Submitted',
                    submittedAt: new Date()
                });
            }

            return apiSuccess(submission, 'Task submitted successfully');
        } catch (dbErr) {
            console.warn('Database offline, storing submission in fallback JSON database:', dbErr);
            const submission = classroomSubmissionsFallbackDb.submit({
                assessmentId: taskId,
                studentId: userId === 'guest' ? '000000000000000000000001' : userId,
                textSubmission,
                audioUrl,
                fileUrl,
                fileName
            });
            
            return apiSuccess(submission, 'Task submitted successfully in fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
