import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Blog from '@/models/blog.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { blogFallbackDb } from '@/utils/blogFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        
        try {
            await dbConnect();
            // Try to find by ID first, then by slug if ID format is not Object ID
            let blog;
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                blog = await Blog.findOne({ $or: [{ _id: id }, { slug: id }] });
            } else {
                blog = await Blog.findOne({ slug: id });
            }
            
            if (!blog) {
                throw new AppError('Blog post not found', 404);
            }
            return apiSuccess(blog);
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            console.warn('Database offline, fetching from fallback JSON database:', dbErr);
            const blog = blogFallbackDb.getById(id) || blogFallbackDb.getBySlug(id);
            if (!blog) {
                throw new AppError('Blog post not found in fallback database', 404);
            }
            return apiSuccess(blog);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        verifyAdmin(request);
        const id = params.id;
        const body = await request.json();
        
        if (body.title && !body.slug) {
            let slug = body.title.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)+/g, '');
            if (!slug) {
                slug = `post-${Date.now()}`;
            }
            body.slug = slug;
        }

        try {
            await dbConnect();
            let blog;
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                blog = await Blog.findOneAndUpdate({ $or: [{ _id: id }, { slug: id }] }, body, { new: true });
            } else {
                blog = await Blog.findOneAndUpdate({ slug: id }, body, { new: true });
            }
            
            if (!blog) {
                throw new AppError('Blog post not found to update', 404);
            }
            return apiSuccess(blog, 'Blog post updated successfully');
        } catch (dbErr: any) {
            if (dbErr instanceof AppError) throw dbErr;
            console.error('Database update error details:', dbErr);
            
            // If it's a validation error or unique constraint/duplicate key error, propagate it
            if (dbErr.name === 'ValidationError' || dbErr.code === 11000 || dbErr.name === 'MongoServerError') {
                throw new AppError(`Database error: ${dbErr.message || 'Validation or duplicate key error'}`, 400);
            }
            
            console.warn('Database offline or connection failed, trying fallback JSON database:', dbErr);
            const blog = blogFallbackDb.update(id, body);
            if (!blog) {
                throw new AppError(`Blog post not found (Database error: ${dbErr.message || 'unknown error'})`, 404);
            }
            return apiSuccess(blog, 'Blog post updated successfully in fallback database');
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
            let blog;
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                blog = await Blog.findOneAndDelete({ $or: [{ _id: id }, { slug: id }] });
            } else {
                blog = await Blog.findOneAndDelete({ slug: id });
            }
            
            if (!blog) {
                throw new AppError('Blog post not found to delete', 404);
            }
            return apiSuccess(null, 'Blog post deleted successfully');
        } catch (dbErr) {
            if (dbErr instanceof AppError) throw dbErr;
            console.warn('Database offline, deleting from fallback JSON database:', dbErr);
            const success = blogFallbackDb.delete(id);
            if (!success) {
                throw new AppError('Blog post not found in fallback database to delete', 404);
            }
            return apiSuccess(null, 'Blog post deleted successfully from fallback database');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
