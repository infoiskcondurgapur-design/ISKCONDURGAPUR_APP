import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Form from '@/models/form.model';
import FormResponse from '@/models/form-response.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // Find the Form config
    const form = await Form.findById(params.id);
    if (!form) {
      throw new AppError('Form not found', 404);
    }

    if (!form.isActive) {
      throw new AppError('This form is currently closed for submissions by the administrator.', 400);
    }

    const now = new Date();
    if (form.opensAt && now < new Date(form.opensAt)) {
      throw new AppError('This form is not yet open for submissions.', 400);
    }

    if (form.closesAt && now > new Date(form.closesAt)) {
      throw new AppError('This form has closed for submissions.', 400);
    }

    // Parse JSON body
    const body = await request.json();
    const answers: Record<string, any> = {};
    
    for (const field of form.fields) {
      const value = body[field.name];
      if (field.required && (value === undefined || value === null || value.toString().trim() === '')) {
        throw new AppError(`Field "${field.label}" is required`, 400);
      }
      answers[field.name] = value !== undefined ? value : '';
    }

    // Save the form submission response
    const newResponse = await FormResponse.create({
      formId: form._id,
      answers,
      status: 'Pending'
    });

    return apiSuccess(newResponse, 'Form submitted successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
