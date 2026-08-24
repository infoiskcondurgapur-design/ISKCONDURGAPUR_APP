import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Batch from '@/models/batch.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyUser } from '@/utils/authHelper';
import { batchesFallbackDb } from '@/utils/batchesFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        let userId = 'guest';
        
        try {
            const user = verifyUser(request);
            userId = user.userId;
        } catch (authErr) {
            // Allow guest access for previewing classroom dashboard
            console.log('No auth token, using guest access for preview');
        }

        try {
            await dbConnect();
            
            // If user is guest, return the default seeded batch
            if (userId === 'guest') {
                let defaultBatch = await Batch.findOne({ code: 'BS5-2026' });
                if (!defaultBatch) {
                    console.log('Seeding default batch in MongoDB...');
                    defaultBatch = await Batch.create({
                        name: "BS #5 - 2026",
                        code: "BS5-2026",
                        description: "Spiritual learning batch 2026",
                        isActive: true,
                        enrolledStudents: []
                    });
                }
                return apiSuccess(defaultBatch ? [defaultBatch] : []);
            }
            
            const userBatches = await Batch.find({ enrolledStudents: userId });
            return apiSuccess(userBatches);
        } catch (dbErr) {
            console.warn('Database offline, serving persistent fallback JSON database for batches:', dbErr);
            const allBatches = batchesFallbackDb.getAll();
            
            // For preview/guest, always return the default batch
            if (userId === 'guest') {
                const guestBatch = allBatches.find((b: any) => b.code === 'BS5-2026');
                return apiSuccess(guestBatch ? [guestBatch] : allBatches);
            }
            
            const userBatches = allBatches.filter((b: any) => 
                b.enrolledStudents && b.enrolledStudents.includes(userId)
            );
            return apiSuccess(userBatches);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        try {
            await dbConnect();
            const batch = await Batch.create(body);
            return apiSuccess(batch, 'Batch created successfully', 201);
        } catch (dbErr) {
            console.warn('Database offline, storing batch in fallback JSON database:', dbErr);
            const batch = batchesFallbackDb.create(body);
            return apiSuccess(batch, 'Batch created successfully in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
