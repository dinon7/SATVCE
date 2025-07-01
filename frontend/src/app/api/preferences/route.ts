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

        // Fetch saved preferences from Firestore
        const preferencesRef = db.collection('preferences')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(5);

        const snapshot = await preferencesRef.get();
        const preferences = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().createdAt.toDate().toISOString(),
        }));

        // Fetch user preferences (settings)
        const userPrefsRef = db.collection('user_preferences').doc(userId);
        const userPrefsDoc = await userPrefsRef.get();
        
        let userPreferences = {
            exportAsPdf: false,
            notifications: true,
            emailUpdates: true,
            darkMode: false,
        };

        if (userPrefsDoc.exists) {
            const userPrefsData = userPrefsDoc.data();
            userPreferences = {
                exportAsPdf: userPrefsData?.exportAsPdf || false,
                notifications: userPrefsData?.notifications !== undefined ? userPrefsData.notifications : true,
                emailUpdates: userPrefsData?.emailUpdates !== undefined ? userPrefsData.emailUpdates : true,
                darkMode: userPrefsData?.darkMode || false,
            };
        }

        return NextResponse.json({
            savedPreferences: preferences,
            userPreferences: userPreferences,
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
        const { name, subjects, careers } = body;

        // Validate the request body
        if (!name || !subjects || !careers) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save the preference to Firestore
        const preferenceRef = await db.collection('preferences').add({
            userId,
            name,
            subjects,
            careers,
            createdAt: new Date(),
        });

        return NextResponse.json({
            id: preferenceRef.id,
            name,
            subjects,
            careers,
            date: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error saving preference:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
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
        const { exportAsPdf, notifications, emailUpdates, darkMode } = body;

        // Get or create user preferences document
        const userPrefsRef = db.collection('user_preferences').doc(userId);
        const userPrefsDoc = await userPrefsRef.get();

        if (userPrefsDoc.exists) {
            // Update existing preferences
            await userPrefsRef.update({
                ...(exportAsPdf !== undefined && { exportAsPdf }),
                ...(notifications !== undefined && { notifications }),
                ...(emailUpdates !== undefined && { emailUpdates }),
                ...(darkMode !== undefined && { darkMode }),
                updatedAt: new Date(),
            });
        } else {
            // Create new preferences document
            await userPrefsRef.set({
                userId,
                exportAsPdf: exportAsPdf || false,
                notifications: notifications !== undefined ? notifications : true,
                emailUpdates: emailUpdates !== undefined ? emailUpdates : true,
                darkMode: darkMode || false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Get the updated preferences
        const updatedDoc = await userPrefsRef.get();
        const updatedData = updatedDoc.data();

        return NextResponse.json({
            id: updatedDoc.id,
            ...updatedData,
            createdAt: updatedData?.createdAt?.toDate().toISOString(),
            updatedAt: updatedData?.updatedAt?.toDate().toISOString(),
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 