import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export async function withAuth(handler: Function, requireAdmin: boolean = false) {
    return async (request: Request) => {
        try {
            // Get the authorization header
            const authHeader = request.headers.get('authorization');
            if (!authHeader?.startsWith('Bearer ')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Verify the token
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await getAuth().verifyIdToken(token);

            // Check admin status if required
            if (requireAdmin && !decodedToken.isAdmin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Call the handler with the decoded token
            return await handler(request, decodedToken);
        } catch (error) {
            console.error('Error in auth middleware:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
} 