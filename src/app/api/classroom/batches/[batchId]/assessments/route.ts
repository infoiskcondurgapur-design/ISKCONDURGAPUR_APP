import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import ClassroomAssessment from '@/models/classroom-assessment.model';
import ClassroomSubmission from '@/models/classroom-submission.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { assessmentsFallbackDb } from '@/utils/assessmentsFallbackDb';
import { classroomSubmissionsFallbackDb } from '@/utils/classroomSubmissionsFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { batchId: string } }
) {
    try {
        const { batchId } = params;
        let userId = 'guest';

        try {
            const user = verifyUser(request);
            userId = user.userId;
        } catch (authErr) {
            console.log('No auth token, using guest access for assessments');
        }

        try {
            await dbConnect();
            let assessments = await ClassroomAssessment.find({ batchId }).sort({ isPinned: -1, dueDate: 1 });
            
            // Seed assessments in MongoDB if they are empty
            if (assessments.length === 0) {
                console.log('Seeding default assessments in MongoDB for batch:', batchId);
                const defaultAssessments = [
                    {
                        batchId,
                        title: "Sloka Memorization - Sri Isopanishad (Avahana, Mantra 1)",
                        description: "Each video shall consist of two Shlokas offered without interruption. For each verse, the student is to state the Verse Number, the Shloka, and its Translation. Eyes must remain closed in inward focus for the duration of the recording to honor the spiritual nature of the verses. αª¬αºìαª░αªñαª┐αªƒαª┐ αª¡αª┐αªíαª┐αªô...",
                        dueDate: new Date("2026-06-29T23:59:59.000Z"),
                        points: 100,
                        isPinned: true,
                        status: "Published",
                        category: "Sloka Memorization"
                    },
                    {
                        batchId,
                        title: "Sloka Memorization - Sri Isopanishad (Mantra 9, Mantra 15)",
                        description: "Each video shall consist of two Shlokas offered without interruption. For each verse, the student is to state the Verse Number, the Shloka, and its Translation. Eyes must remain closed in inward focus for the duration of the recording to honor the spiritual nature of the verses. αª¬αºìαª░αªñαª┐αªƒαª┐ αª¡αª┐αªíαª┐αªô...",
                        dueDate: new Date("2026-06-29T23:59:59.000Z"),
                        points: 100,
                        isPinned: true,
                        status: "Published",
                        category: "Sloka Memorization"
                    },
                    {
                        batchId,
                        title: "Today's listening to Srila Prabhupada - 137 (27.06.26)",
                        description: "Listen to the audio and write down your reflection or daily realization. Record your reflection using your microphone if desired.",
                        youtubeUrl: "https://www.youtube.com/watch?v=igYTZO49JS8",
                        dueDate: new Date("2026-06-27T23:59:59.000Z"),
                        points: 100,
                        isPinned: false,
                        status: "Published",
                        category: "Daily Listening"
                    },
                    {
                        batchId,
                        title: "Today's listening to Srila Prabhupada - 136 (26.06.26)",
                        description: "Listen to the audio and write down your reflection or daily realization.",
                        youtubeUrl: "https://www.youtube.com/watch?v=46_GzvqGc7I",
                        dueDate: new Date("2026-06-26T23:59:59.000Z"),
                        points: 100,
                        isPinned: false,
                        status: "Closed",
                        category: "Daily Listening"
                    },
                    {
                        batchId,
                        title: "Today's listening to Srila Prabhupada - 135 (25.06.26)",
                        description: "Listen to the audio and write down your reflection or daily realization.",
                        youtubeUrl: "https://www.youtube.com/watch?v=Ut4UXlg7mWQ",
                        dueDate: new Date("2026-06-25T23:59:59.000Z"),
                        points: 100,
                        isPinned: false,
                        status: "Closed",
                        category: "Daily Listening"
                    }
                ];
                await ClassroomAssessment.create(defaultAssessments);
                // Re-fetch seeded assessments
                assessments = await ClassroomAssessment.find({ batchId }).sort({ isPinned: -1, dueDate: 1 });
            }

            // Map assessments to include user submission status
            const mappedAssessments = await Promise.all(
                assessments.map(async (assessment) => {
                    let submission = await ClassroomSubmission.findOne({
                        assessmentId: assessment._id,
                        studentId: userId === 'guest' ? '000000000000000000000001' : userId
                    });
                    
                    // Auto-seed submissions for task1, task2 and task4 in MongoDB for preview/guest
                    if (!submission && userId === 'guest') {
                        const isTask1 = assessment.title.includes("Mantra 1");
                        const isTask2 = assessment.title.includes("Mantra 9");
                        const isTask4 = assessment.title.includes("136");
                        
                        if (isTask1 || isTask2 || isTask4) {
                            submission = await ClassroomSubmission.create({
                                assessmentId: assessment._id,
                                studentId: '000000000000000000000001',
                                textSubmission: isTask1 
                                    ? "I have recorded and completed the first Sloka memorization task. Please find my review."
                                    : isTask2 
                                        ? "Submitted. Eyes closed memorization video of Sri Isopanishad Mantra 9 & 15 is uploaded."
                                        : "Great lecture by Srila Prabhupada about devotional service and the nature of the soul.",
                                status: 'Submitted',
                                submittedAt: new Date()
                            });
                        }
                    }
                    
                    return {
                        ...assessment.toObject(),
                        submissionStatus: submission ? submission.status : 'Not Submitted'
                    };
                })
            );

            return apiSuccess(mappedAssessments);
        } catch (dbErr) {
            console.warn('Database offline, checking fallback JSON database for assessments:', dbErr);
            const assessments = assessmentsFallbackDb.getByBatchId(batchId);
            
            const mappedAssessments = assessments.map((assessment: any) => {
                const submission = classroomSubmissionsFallbackDb.getByStudentAndAssessment(
                    userId === 'guest' ? '000000000000000000000001' : userId,
                    assessment._id
                );
                return {
                    ...assessment,
                    submissionStatus: submission ? submission.status : 'Not Submitted'
                };
            });

            return apiSuccess(mappedAssessments);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
