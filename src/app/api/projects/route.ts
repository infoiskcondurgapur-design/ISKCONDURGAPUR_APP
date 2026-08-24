import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Project from '@/models/project.model';
import { handleApiError, apiSuccess } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { projectsFallbackDb } from '@/utils/projectsFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
            const projects = await Project.find({}).sort({ createdAt: -1 });
            return apiSuccess(projects);
        } catch (dbErr) {
            console.warn('Database offline, serving persistent fallback JSON database:', dbErr);
            const projects = projectsFallbackDb.getAll();
            return apiSuccess(projects);
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
            const project = await Project.create(body);
            return apiSuccess(project, 'Project created successfully', 201);
        } catch (dbErr) {
            console.warn('Database offline, storing project in fallback JSON database:', dbErr);
            const project = projectsFallbackDb.create(body);
            return apiSuccess(project, 'Project created successfully in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
