import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/db';
import Form from '@/models/form.model';
import FormResponse from '@/models/form-response.model';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const isObjectId = mongoose.Types.ObjectId.isValid(params.id);
    const query = isObjectId ? { _id: params.id } : { slug: params.id };
    
    const form = await Form.findOne(query).lean();
    if (!form) {
      throw new AppError('Form not found', 404);
    }
    return apiSuccess(form);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    await dbConnect();
    
    const body = await request.json();
    const { title, description, fields, syncToGoogleDrive, googleDriveFolderId, isActive, opensAt, closesAt } = body;
    
    const updatedForm = await Form.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        fields,
        syncToGoogleDrive: !!syncToGoogleDrive,
        googleDriveFolderId,
        isActive: isActive !== undefined ? !!isActive : true,
        opensAt: opensAt ? new Date(opensAt) : null,
        closesAt: closesAt ? new Date(closesAt) : null
      },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      throw new AppError('Form not found', 404);
    }

    return apiSuccess(updatedForm, 'Form updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    await dbConnect();

    // Delete the form configuration
    const deletedForm = await Form.findByIdAndDelete(params.id);
    if (!deletedForm) {
      throw new AppError('Form not found', 404);
    }

    // Also clean up all submissions for this form
    await FormResponse.deleteMany({ formId: params.id });

    return apiSuccess(deletedForm, 'Form and all submissions deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
