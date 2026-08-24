import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Form from '@/models/form.model';
import { verifyAdmin } from '@/utils/authHelper';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      verifyAdmin(request);
    }

    await dbConnect();
    const query = isAdmin ? {} : { isActive: true };
    const forms = await Form.find(query).sort({ createdAt: -1 }).lean();
    return apiSuccess(forms);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await dbConnect();
    
    const body = await request.json();
    const { title, description, fields, syncToGoogleDrive, googleDriveFolderId, isActive, opensAt, closesAt } = body;
    
    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      return Response.json({ message: 'Title and fields are required' }, { status: 400 });
    }

    // Generate slug and verify uniqueness
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Form.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newForm = await Form.create({
      title,
      slug,
      description,
      fields,
      syncToGoogleDrive: !!syncToGoogleDrive,
      googleDriveFolderId,
      isActive: isActive !== undefined ? !!isActive : true,
      opensAt: opensAt ? new Date(opensAt) : undefined,
      closesAt: closesAt ? new Date(closesAt) : undefined
    });

    return apiSuccess(newForm, 'Form created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
