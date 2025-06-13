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

        // Fetch pending resources from Firestore
        const resourcesRef = db.collection('resources')
            .where('status', '==', 'pending')
            .orderBy('submittedAt', 'desc');

        const snapshot = await resourcesRef.get();
        const resources = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt.toDate().toISOString(),
        }));

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching pending resources:', error);
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

        // Verify the token and check admin status
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        
        if (!decodedToken.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get the request body
        const body = await request.json();
        const { resourceId, action } = body;

        if (!resourceId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update the resource status
        const resourceRef = db.collection('resources').doc(resourceId);
        const resourceDoc = await resourceRef.get();

        if (!resourceDoc.exists) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            await resourceRef.update({
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: decodedToken.uid,
            });
        } else if (action === 'reject') {
            await resourceRef.update({
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: decodedToken.uid,
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating resource status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 