import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db';
import Blog from '@/models/blog.model';
import { handleApiError, apiSuccess, AppError } from '@/utils/errorHandler';
import { verifyAdmin } from '@/utils/authHelper';
import { blogFallbackDb } from '@/utils/blogFallbackDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        
        try {
            await dbConnect();
            
            let query: any = {};
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } },
                    { summary: { $regex: search, $options: 'i' } }
                ];
            }
            if (category && category !== 'All') {
                query.category = category;
            }
            if (status && status !== 'All') {
                query.status = status;
            }
            
            const blogs = await Blog.find(query).sort({ createdAt: -1 });
            return apiSuccess(blogs);
        } catch (dbErr) {
            console.warn('Database offline, serving persistent fallback JSON database for blogs:', dbErr);
            let blogs = blogFallbackDb.getAll();
            
            if (search) {
                blogs = blogs.filter((b: any) => 
                    (b.title && b.title.toLowerCase().includes(search.toLowerCase())) ||
                    (b.content && b.content.toLowerCase().includes(search.toLowerCase())) ||
                    (b.summary && b.summary.toLowerCase().includes(search.toLowerCase()))
                );
            }
            if (category && category !== 'All') {
                blogs = blogs.filter((b: any) => b.category === category);
            }
            if (status && status !== 'All') {
                blogs = blogs.filter((b: any) => b.status === status);
            }
            
            // Sort by Date descending
            blogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            return apiSuccess(blogs);
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        verifyAdmin(request);
        const body = await request.json();
        
        // Auto-generate slug from title if not provided
        if (!body.slug && body.title) {
            let slug = body.title.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)+/g, '');
            if (!slug) {
                slug = `post-${Date.now()}`;
            }
            body.slug = slug;
        }

        try {
            await dbConnect();
            const blog = await Blog.create(body);
            return apiSuccess(blog, 'Blog post created successfully', 201);
        } catch (dbErr: any) {
            console.error('Database create error details:', dbErr);
            
            // If it's a validation error or unique constraint/duplicate key error, propagate it
            if (dbErr.name === 'ValidationError' || dbErr.code === 11000 || dbErr.name === 'MongoServerError') {
                throw new AppError(`Database error: ${dbErr.message || 'Validation or duplicate key error'}`, 400);
            }
            
            console.warn('Database offline or connection failed, trying fallback JSON database:', dbErr);
            const blog = blogFallbackDb.create(body);
            return apiSuccess(blog, 'Blog post created successfully in fallback database', 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}
