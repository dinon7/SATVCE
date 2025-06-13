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

        // Verify the token
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // Fetch recent activity from Firestore
        const activityRef = db.collection('activity')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(10);

        const snapshot = await activityRef.get();
        const activities = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            time: doc.data().timestamp.toDate().toISOString(),
        }));

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to log activity
export async function logActivity(userId: string, type: string, description: string) {
    try {
        await db.collection('activity').add({
            userId,
            type,
            description,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
} 