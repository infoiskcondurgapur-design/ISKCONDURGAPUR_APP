import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Project from '@/models/project.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { projectsFallbackDb } from '@/utils/projectsFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        try {
            await dbConnect();
            const project = await Project.findById(params.id);
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            return apiSuccess(project);
        } catch (dbErr) {
            console.warn('Database offline, retrieving project from fallback JSON database');
            const project = projectsFallbackDb.getById(params.id);
            if (!project) {
                throw new AppError('Project not found in fallback database', 404);
            }
            return apiSuccess(project);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        verifyAdmin(request);
        const body = await request.json();

        try {
            await dbConnect();
            const project = await Project.findByIdAndUpdate(params.id, body, { new: true });
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            return apiSuccess(project, 'Project updated successfully');
        } catch (dbErr) {
            console.warn('Database offline, updating project in fallback JSON database');
            const project = projectsFallbackDb.update(params.id, body);
            if (!project) {
                throw new AppError('Project not found in fallback database', 404);
            }
            return apiSuccess(project, 'Project updated successfully in fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        verifyAdmin(request);

        try {
            await dbConnect();
            const project = await Project.findByIdAndDelete(params.id);
            if (!project) {
                throw new AppError('Project not found', 404);
            }
            return apiSuccess(null, 'Project deleted successfully');
        } catch (dbErr) {
            console.warn('Database offline, deleting project from fallback JSON database');
            const success = projectsFallbackDb.delete(params.id);
            if (!success) {
                throw new AppError('Project not found in fallback database', 404);
            }
            return apiSuccess(null, 'Project deleted successfully from fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
