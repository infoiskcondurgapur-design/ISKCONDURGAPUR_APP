import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Batch from '@/models/batch.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { batchesFallbackDb } from '@/utils/batchesFallbackDb';

export async function POST(request: NextRequest) {
    try {
        let userId = 'guest';
        try {
            const user = verifyUser(request);
            userId = user.userId;
        } catch (authErr) {
            console.log('User joining batch as guest');
        }

        const { code } = await request.json();
        if (!code) {
            throw new AppError('Batch code is required', 400);
        }

        try {
            await dbConnect();
            const batch = await Batch.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });
            if (!batch) {
                throw new AppError('Invalid batch code', 404);
            }

            // For guests, we pretend they enrolled successfully
            if (userId === 'guest') {
                return apiSuccess(batch, 'Enrolled in batch successfully (Guest Mode)');
            }

            if (!batch.enrolledStudents.includes(userId)) {
                batch.enrolledStudents.push(userId);
                await batch.save();
            }

            return apiSuccess(batch, 'Enrolled in batch successfully');
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            
            console.warn('Database offline, checking fallback JSON database for batch:', dbErr);
            const batch = batchesFallbackDb.getByCode(code);
            if (!batch) {
                throw new AppError('Invalid batch code', 404);
            }

            if (userId === 'guest') {
                return apiSuccess(batch, 'Enrolled in batch successfully (Guest Mode)');
            }

            const updatedBatch = batchesFallbackDb.enrollStudent(batch._id, userId);
            return apiSuccess(updatedBatch || batch, 'Enrolled in batch successfully');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
