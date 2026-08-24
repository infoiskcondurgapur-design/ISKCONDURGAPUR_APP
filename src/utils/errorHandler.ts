import { NextResponse } from 'next/server';
import logger from './logger';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// Best-effort persistence of server errors for the admin Error Logs page
async function persistErrorLog(error: any) {
    try {
        const mongoose = await import('mongoose');
        if (mongoose.default.connection.readyState !== 1) return;
        const ErrorLog = (await import('@/models/error-log.model')).default;
        await ErrorLog.create({
            message: String(error?.message || 'Unknown error').slice(0, 500),
            name: String(error?.name || 'Error'),
            statusCode: Number(error?.statusCode) || 500,
            stack: error?.stack ? String(error.stack).slice(0, 2000) : undefined
        });
    } catch {
        // Never let error logging itself break the response
    }
}

export async function handleApiError(error: any) {
    logger.error('API Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error.details
    });

    // Only persist unexpected errors (skip client mistakes like validation/auth)
    const statusCode = error instanceof AppError ? error.statusCode : error?.name === 'ValidationError' ? 400 : 500;
    if (statusCode >= 500) {
        await persistErrorLog(error);
    }

    if (error instanceof AppError) {
        return NextResponse.json(
            { message: error.message, details: error.details },
            { status: error.statusCode }
        );
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        return NextResponse.json(
            { message: 'Validation Error', details: error.errors },
            { status: 400 }
        );
    }

    // Default error
    return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
    );
}

export function apiSuccess(data: any, message: string = 'Success', status: number = 200) {
    return NextResponse.json(
        { message, data },
        { status }
    );
}
