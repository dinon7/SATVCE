import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
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

const db = getFirestore();

export async function GET(request: Request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the token and check admin status
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        
        if (!decodedToken.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch statistics from Firestore
        const [
            usersSnapshot,
            quizzesSnapshot,
            reportsSnapshot,
            activeUsersSnapshot
        ] = await Promise.all([
            db.collection('users').count().get(),
            db.collection('quizResults').count().get(),
            db.collection('reports').count().get(),
            db.collection('users')
                .where('lastActive', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
                .count()
                .get()
        ]);

        return NextResponse.json({
            totalUsers: usersSnapshot.data().count,
            totalQuizzes: quizzesSnapshot.data().count,
            totalReports: reportsSnapshot.data().count,
            activeUsers: activeUsersSnapshot.data().count,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 