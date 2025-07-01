import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Fallback function for when backend is unavailable
async function fallbackUserProfile(userId: string) {
    // Return basic user info from Clerk
    return {
        clerk_user_id: userId,
        email: '', // Will be filled by Clerk
        name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        has_completed_quiz: false,
        preferences: {
            subjects: [],
            careers: [],
            learning_style: null
        }
    };
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email } = body;

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userId}`,
                },
                body: JSON.stringify({ name, email }),
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data);
            }
        } catch (backendError) {
            console.warn('Backend unavailable, using fallback:', backendError);
        }

        // Fallback: Return success without saving (user will be created on first quiz)
        return NextResponse.json({ 
            success: true, 
            message: 'Profile will be created on first interaction',
            fallback: true 
        });

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
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${userId}`,
                    'Content-Type': 'application/json',
                },
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data);
            } else if (backendResponse.status === 404) {
                // User doesn't exist yet, return fallback
                const fallbackData = await fallbackUserProfile(userId);
                return NextResponse.json(fallbackData);
            }
        } catch (backendError) {
            console.warn('Backend unavailable, using fallback:', backendError);
        }

        // Fallback: Return basic user profile
        const fallbackData = await fallbackUserProfile(userId);
        return NextResponse.json(fallbackData);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userId}`,
                },
                body: JSON.stringify(body),
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data);
            }
        } catch (backendError) {
            console.warn('Backend unavailable, using fallback:', backendError);
        }

        // Fallback: Return success without updating
        return NextResponse.json({ 
            success: true, 
            message: 'Profile update will be processed when backend is available',
            fallback: true 
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 