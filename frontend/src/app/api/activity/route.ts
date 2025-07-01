import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export const dynamic = "force-dynamic";

// Fallback activity data for when backend is unavailable
function getFallbackUserActivity() {
    return {
        activities: [],
        fallback: true,
        message: 'Using fallback data - backend unavailable',
        total: 0
    };
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/activity`, {
                headers: {
                    'Authorization': `Bearer ${userId}`,
                    'Content-Type': 'application/json',
                },
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data || []);
            } else if (backendResponse.status === 404) {
                // No activity found, return empty array
                return NextResponse.json([]);
            }
        } catch (backendError) {
            console.warn('Backend unavailable, using fallback activity data:', backendError);
        }

        // Fallback: Return empty activity list
        const fallbackData = getFallbackUserActivity();
        return NextResponse.json(fallbackData.activities || []);

    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 