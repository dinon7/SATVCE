import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { auth } from '@/lib/firebase-admin';

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

export async function POST(request: Request) {
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

        // Get the request body
        const body = await request.json();
        const { name, email } = body;

        // Create or update user profile
        await db.collection('users').doc(userId).set({
            name,
            email,
            createdAt: new Date(),
            updatedAt: new Date(),
            hasCompletedQuiz: false,
            quizResults: null,
            preferences: {
                subjects: [],
                careers: [],
                learningStyle: null
            }
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating/updating user profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Fetch user profile from Firestore
        const userProfile = await fetchUserProfile(uid);
        if (!userProfile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const body = await request.json();
        const updatedProfile = await updateUserProfile(uid, body);

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function fetchUserProfile(uid: string) {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists ? userDoc.data() : null;
}

async function updateUserProfile(uid: string, data: any) {
    await db.collection('users').doc(uid).update(data);
    return data;
} 