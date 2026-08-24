import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Quote from '@/models/quote.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { quoteFallbackDb } from '@/utils/quoteFallbackDb';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        verifyAdmin(request);
        const id = params.id;
        const body = await request.json();

        try {
            await dbConnect();
            const quote = await Quote.findByIdAndUpdate(id, body, { new: true });
            if (!quote) {
                throw new AppError('Quote not found', 404);
            }
            return apiSuccess(quote, 'Quote updated successfully');
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            console.warn('Database offline, updating in fallback JSON database:', dbErr);
            const quote = quoteFallbackDb.update(id, body);
            if (!quote) {
                throw new AppError('Quote not found in fallback database', 404);
            }
            return apiSuccess(quote, 'Quote updated successfully in fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        verifyAdmin(request);
        const id = params.id;

        try {
            await dbConnect();
            const quote = await Quote.findByIdAndDelete(id);
            if (!quote) {
                throw new AppError('Quote not found', 404);
            }
            return apiSuccess(null, 'Quote deleted successfully');
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            console.warn('Database offline, deleting from fallback JSON database:', dbErr);
            const success = quoteFallbackDb.delete(id);
            if (!success) {
                throw new AppError('Quote not found in fallback database to delete', 404);
            }
            return apiSuccess(null, 'Quote deleted successfully from fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
