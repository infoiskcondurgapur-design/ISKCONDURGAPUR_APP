import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Quote from '@/models/quote.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { quoteFallbackDb } from '@/utils/quoteFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
            const quotes = await Quote.find({}).sort({ createdAt: -1 });
            return apiSuccess(quotes);
        } catch (dbErr) {
            console.warn('Database offline, serving fallback JSON database for quotes:', dbErr);
            const quotes = quoteFallbackDb.getAll();
            quotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return apiSuccess(quotes);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        verifyAdmin(request);
        const body = await request.json();
        
        try {
            await dbConnect();
            const quote = await Quote.create(body);
            return apiSuccess(quote, 'Quote created successfully', 201);
        } catch (dbErr) {
            console.warn('Database offline, storing quote in fallback JSON database:', dbErr);
            const quote = quoteFallbackDb.create(body);
            return apiSuccess(quote, 'Quote created successfully in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
