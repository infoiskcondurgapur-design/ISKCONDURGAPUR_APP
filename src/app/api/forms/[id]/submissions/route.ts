import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import FormResponse from '@/models/form-response.model';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    await dbConnect();
    
    const responses = await FormResponse.find({ formId: params.id })
      .sort({ createdAt: -1 })
      .lean();
      
    return apiSuccess(responses);
  } catch (error) {
    return handleApiError(error);
  }
}
