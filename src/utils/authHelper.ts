import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface VerifiedAdmin {
    userId: string;
    role: string;
    username: string;
}

export interface VerifiedUser {
    userId: string;
    role: string;
    username: string;
}

export function verifyUser(request: NextRequest): VerifiedUser {
    const authToken = request.cookies.get('iskcon_admin_token')?.value
        || request.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
        throw new AppError('Unauthorized', 401);
    }

    try {
        const decoded = verify(authToken, JWT_SECRET) as any;
        return {
            userId: decoded.sub || decoded.id,
            role: decoded.role,
            username: decoded.username
        };
    } catch (error) {
        throw new AppError('Unauthorized: Invalid token signature', 401);
    }
}

export function verifyAdmin(request: NextRequest): VerifiedAdmin {
    const authToken = request.cookies.get('iskcon_admin_token')?.value
        || request.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
        throw new AppError('Unauthorized', 401);
    }

    try {
        const decoded = verify(authToken, JWT_SECRET) as any;
        return {
            userId: decoded.sub || decoded.id,
            role: decoded.role,
            username: decoded.username
        };
    } catch (error) {
        throw new AppError('Unauthorized: Invalid token signature', 401);
    }
}
