import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import FormResponse from '@/models/form-response.model';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    await dbConnect();
    
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['Pending', 'Reviewed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    
    const updated = await FormResponse.findByIdAndUpdate(
      params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      throw new AppError('Submission response not found', 404);
    }
    
    return apiSuccess(updated, 'Submission updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    await dbConnect();
    
    const deleted = await FormResponse.findByIdAndDelete(params.id);
    if (!deleted) {
      throw new AppError('Submission response not found', 404);
    }
    
    return apiSuccess(deleted, 'Submission response deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
